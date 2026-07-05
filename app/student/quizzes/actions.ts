'use server'
import { createClient, requireStudent } from '@/lib/supabase/server'
import { gradeEssayCodeWithGemini } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'


// بدء محاولة
export async function startQuizAttempt(quiz_id: string) {
  const { supabase, user } = await requireStudent()

  // existing in_progress?
  const { data: existing } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quiz_id)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .maybeSingle()
  if (existing) return existing

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id, student_id: user.id, status: 'in_progress' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// حفظ إجابة debounce 500ms
export async function upsertStudentAnswer(input: {
  attempt_id: string
  question_id: string
  selected_option?: string | null
  written_code?: string | null
}) {
  const { supabase, user } = await requireStudent()

  // تحقق ملكية + منع التلاعب بالوقت
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes!inner(duration_minutes)')
    .eq('id', input.attempt_id)
    .eq('student_id', user.id)
    .single()

  if (!attempt) throw new Error('Attempt not found')
  if (attempt.status !== 'in_progress') throw new Error('Attempt closed')

  // Server-side timer tampering protection
  const started = new Date(attempt.started_at).getTime()
  const durationMs = (attempt.quizzes as any).duration_minutes * 60 * 1000
  const endTime = started + durationMs
  if (Date.now() > endTime + 2000) { // 2s grace
    // auto-close
    await supabase.from('quiz_attempts').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', input.attempt_id)
    throw new Error('انتهى وقت الامتحان - تم إغلاق المحاولة تلقائياً')
  }

  const { error } = await supabase.from('student_answers').upsert({
    attempt_id: input.attempt_id,
    question_id: input.question_id,
    selected_option: input.selected_option ?? null,
    written_code: input.written_code ?? null
  }, { onConflict: 'attempt_id,question_id' })

  if (error) throw new Error(error.message)
  return { success: true, saved_at: new Date().toISOString() }
}

// SPECIFICATION 2: GEMINI AI AUTOMATED EVALUATION ENGINE
export async function submitAndGradeQuiz(attempt_id: string) {
  const { supabase, user } = await requireStudent()

  const { data: attempt, error: aErr } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes!inner(total_score, duration_minutes, title)')
    .eq('id', attempt_id)
    .eq('student_id', user.id)
    .single()
  if (aErr || !attempt) throw new Error('Attempt not found')

  if (attempt.status === 'graded') return attempt

  // Mark as submitted first: the grading RPC below only releases
  // correct_option once this attempt is no longer in_progress.
  await supabase.from('quiz_attempts').update({ status: 'submitted' }).eq('id', attempt_id)

  // جلب الأسئلة والإجابات
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', attempt.quiz_id)
    .order('order_index')

  // correct_option is column-REVOKE'd from direct client/authenticated select
  // (see schema.sql) to prevent students reading answers via console/network
  // inspection. Grading fetches it separately through a SECURITY DEFINER RPC.
  const { data: correctOptions } = await supabase.rpc('get_correct_options_for_grading', { p_quiz_id: attempt.quiz_id })
  const correctMap = new Map((correctOptions ?? []).map((r: any) => [r.id, r.correct_option]))

  const { data: answers } = await supabase
    .from('student_answers')
    .select('*')
    .eq('attempt_id', attempt_id)

  const answerMap = new Map((answers ?? []).map(a => [a.question_id, a]))

  let totalScore = 0
  const aiCritiques: string[] = []

  for (const q of questions ?? []) {
    const ans = answerMap.get(q.id)
    const correctOption = correctMap.get(q.id)
    let is_correct = false
    let score_awarded = 0
    let critique = ''

    if (q.q_type === 'multiple_choice') {
      // Deterministic Pass
      is_correct = !!ans?.selected_option && ans.selected_option === correctOption
      score_awarded = is_correct ? q.max_points : 0
      critique = is_correct ? 'إجابة صحيحة.' : `الإجابة الصحيحة هي ${correctOption}.`
    } else {
      // AI-Powered Pass
      const code = ans?.written_code?.trim() || ''
      if (!code) {
        score_awarded = 0
        is_correct = false
        critique = 'لم يتم تقديم كود.'
      } else {
        try {
          const graded = await gradeEssayCodeWithGemini({
            question_text: q.question_text,
            student_code: code,
            max_points: q.max_points,
            evaluation_meta: q.evaluation_meta
          })
          score_awarded = graded.score_awarded
          is_correct = graded.is_correct
          critique = graded.arabic_critique
        } catch (e:any) {
          score_awarded = Math.floor(q.max_points * 0.3)
          is_correct = false
          critique = 'خطأ في التصحيح الآلي، تم منح درجة جزئية.'
        }
      }
    }

    totalScore += score_awarded
    aiCritiques.push(`س${q.order_index+1}: ${critique}`)

    // update answer row (direct update is blocked by trg_protect_student_answer_grading;
    // this RPC sets the bypass flag after verifying attempt ownership)
    await supabase.rpc('grade_student_answer', {
      p_attempt_id: attempt_id,
      p_question_id: q.id,
      p_is_correct: is_correct,
      p_score_awarded: score_awarded
    })
  }

  const ai_feedback = aiCritiques.join('\n')

  // تحديث المحاولة graded
  await supabase.from('quiz_attempts').update({
    status: 'graded',
    score_achieved: totalScore,
    submitted_at: new Date().toISOString(),
    ai_feedback
  }).eq('id', attempt_id)

  // update XP & streak via SQL function
  try {
    const totalQuizScore = (attempt.quizzes as any)?.total_score ?? totalScore
    await supabase.rpc('update_student_xp_and_streak', {
      p_user_id: user.id,
      p_score: totalScore,
      p_total: totalQuizScore
    })
  } catch {}

  revalidatePath('/student/dashboard')
  revalidatePath('/student/quizzes')

  return {
    attempt_id,
    score_achieved: totalScore,
    ai_feedback
  }
}

export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createClient()
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
  const { data: questions } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order_index')

  // SECURITY: never send correct_option to the student's browser. It would be
  // visible in the RSC payload / network tab before the student even answers.
  const safeQuestions = (questions ?? []).map(({ correct_option, ...rest }) => rest)

  return { quiz, questions: safeQuestions }
}

export async function getMyAttempt(quizId: string) {
  const { supabase, user } = await requireStudent()
  const { data } = await supabase.from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}
