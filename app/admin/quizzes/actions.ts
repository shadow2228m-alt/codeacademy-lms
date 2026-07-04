'use server'
import { requireAdmin, createClient } from '@/lib/supabase/server'
import { CreateQuizInput, QuizBuilderQuestionInput } from '@/lib/types'
import { revalidatePath } from 'next/cache'


// SPECIFICATION 1: DYNAMIC QUIZ BUILDER
export async function createQuizTransaction(input: CreateQuizInput) {
  const { supabase } = await requireAdmin()

  // strict role validation already done
  if (!input.title?.trim()) throw new Error('Quiz title required')
  if (input.duration_minutes < 1) throw new Error('Invalid duration')
  if (!input.questions?.length) throw new Error('At least 1 question required')

  // atomic transaction via supabase rpc style - sequential with rollback guard
  const { data: quiz, error: qErr } = await supabase
    .from('quizzes')
    .insert({
      title: input.title.trim(),
      duration_minutes: input.duration_minutes,
      total_score: input.total_score
    })
    .select('id')
    .single()

  if (qErr || !quiz) {
    throw new Error('فشل إنشاء الاختبار: ' + qErr?.message)
  }

  const questionsPayload = input.questions.map((qq: QuizBuilderQuestionInput, idx) => ({
    quiz_id: quiz.id,
    q_type: qq.q_type,
    question_text: qq.question_text,
    options: qq.q_type === 'multiple_choice' ? qq.options ?? null : null,
    correct_option: qq.q_type === 'multiple_choice' ? qq.correct_option ?? null : null,
    max_points: qq.max_points ?? 10,
    order_index: qq.order_index ?? idx,
    evaluation_meta: qq.q_type === 'essay_code' ? (qq.evaluation_meta ?? null) : null
  }))

  const { error: insErr } = await supabase.from('questions').insert(questionsPayload)
  if (insErr) {
    // rollback quiz
    await supabase.from('quizzes').delete().eq('id', quiz.id)
    throw new Error('فشل إدخال الأسئلة: ' + insErr.message)
  }

  revalidatePath('/admin/quizzes')
  revalidatePath('/student/quizzes')
  return { success: true, quiz_id: quiz.id }
}

export async function listQuizzesAdmin() {
  const supabase = createClient()
  const { data } = await supabase.from('quizzes').select('*, questions(count)').order('created_at', { ascending: false })
  return data ?? []
}

export async function deleteQuizAdmin(quizId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/quizzes')
  return { success: true }
}
