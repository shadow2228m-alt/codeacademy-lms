'use client'
import { useState, useTransition } from 'react'
import { createQuizTransaction } from '@/app/admin/quizzes/actions'
import type { QuizBuilderQuestionInput, QuestionType } from '@/lib/types'

const emptyMC = (): QuizBuilderQuestionInput => ({
  q_type: 'multiple_choice',
  question_text: '',
  max_points: 10,
  order_index: 0,
  options: { A: '', B: '', C: '', D: '' },
  correct_option: 'A'
})

const emptyEssay = (): QuizBuilderQuestionInput => ({
  q_type: 'essay_code',
  question_text: '',
  max_points: 15,
  order_index: 0,
  evaluation_meta: { max_chars: 2000, require_for_loop: false, require_function_name: null }
})

export default function QuizBuilder() {
  const [title, setTitle] = useState('اختبار بايثون المتقدم #1')
  const [duration, setDuration] = useState(30)
  const [totalScore, setTotalScore] = useState(100)
  const [questions, setQuestions] = useState<QuizBuilderQuestionInput[]>([emptyMC()])
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const addQuestion = (type: QuestionType) => {
    setQuestions(q => [...q, { ...(type==='multiple_choice'?emptyMC():emptyEssay()), order_index: q.length, q_type: type }])
  }

  const updateQ = (i: number, patch: Partial<QuizBuilderQuestionInput>) => {
    setQuestions(qs => qs.map((qq, idx) => idx===i ? { ...qq, ...patch } : qq))
  }

  const submit = () => {
    setMsg(null)
    startTransition(async () => {
      try {
        const res = await createQuizTransaction({
          title,
          duration_minutes: Number(duration),
          total_score: Number(totalScore),
          questions: questions.map((q, idx) => ({ ...q, order_index: idx }))
        })
        setMsg(`✅ تم إنشاء الاختبار بنجاح — ID: ${res.quiz_id}`)
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  return (
    <div className="grid grid-cols-12 gap-6" dir="rtl">
      {/* Bento-grid control panel */}
      <section className="col-span-12 lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-zinc-900/80 to-slate-900/70 p-5 shadow-[0_0_35px_rgba(0,255,255,0.06)]">
          <h2 className="text-cyan-300 font-bold mb-4">لوحة التحكم Bento</h2>
          <label className="block text-sm text-zinc-300 mb-1">Quiz Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)}
            className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Duration (min)</label>
              <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value||'0'))}
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-3" />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Total Points</label>
              <input type="number" value={totalScore} onChange={e=>setTotalScore(parseInt(e.target.value||'0'))}
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-3" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={()=>addQuestion('multiple_choice')}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 hover:bg-cyan-500/25 transition text-cyan-200 text-sm">+ MC سؤال</button>
            <button onClick={()=>addQuestion('essay_code')}
              className="flex-1 py-2.5 rounded-xl bg-fuchsia-500/15 border border-fuchsia-400/30 hover:bg-fuchsia-500/25 transition text-fuchsia-200 text-sm">+ Essay Code</button>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
          <div className="text-sm text-emerald-300">Dynamic Action Matrix</div>
          <div className="text-2xl font-extrabold mt-1">{questions.length} سؤال</div>
          <div className="text-xs text-zinc-400 mt-2">
            MC: {questions.filter(q=>q.q_type==='multiple_choice').length} • Essay: {questions.filter(q=>q.q_type==='essay_code').length}
          </div>
          <button disabled={isPending} onClick={submit}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black font-bold disabled:opacity-50">
            {isPending ? 'جارٍ الحفظ الذري...' : 'Create Quiz Transaction'}
          </button>
          {msg && <div className="mt-3 text-sm text-amber-300">{msg}</div>}
        </div>
      </section>

      {/* Dynamic Action Matrix Array */}
      <section className="col-span-12 lg:col-span-8 space-y-5">
        {questions.map((q, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs">
                <span className={`px-2 py-1 rounded-full ${q.q_type==='multiple_choice' ? 'bg-cyan-900/40 text-cyan-300' : 'bg-fuchsia-900/40 text-fuchsia-300'}`}>
                  {q.q_type}
                </span>
                <span className="mr-3 text-zinc-400">#{i+1}</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" value={q.max_points} onChange={e=>updateQ(i,{max_points: parseInt(e.target.value||'0')})}
                  className="w-20 bg-black/50 border border-zinc-700 rounded-lg px-2 py-1 text-center text-sm" />
                <span className="text-zinc-500 text-xs">pts</span>
                <button onClick={()=>setQuestions(qs=>qs.filter((_,idx)=>idx!==i))}
                  className="text-red-400 text-xs px-2">حذف</button>
              </div>
            </div>

            <textarea
              placeholder="نص السؤال..."
              value={q.question_text}
              onChange={e=>updateQ(i,{question_text: e.target.value})}
              className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 min-h-[90px] focus:border-cyan-500 outline-none"
            />

            {q.q_type==='multiple_choice' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {(['A','B','C','D'] as const).map(opt => (
                  <div key={opt}>
                    <label className="text-xs text-zinc-400">Choice {opt}</label>
                    <input
                      value={q.options?.[opt] ?? ''}
                      onChange={e=>updateQ(i,{ options: { ...q.options!, [opt]: e.target.value } as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 mt-1 focus:border-cyan-500 outline-none"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 mt-1">
                  <label className="text-xs text-zinc-400">correct_option</label>
                  <select value={q.correct_option ?? 'A'}
                    onChange={e=>updateQ(i,{correct_option: e.target.value as any})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-800/30">
                <div className="text-fuchsia-300 text-sm font-bold mb-2">Essay Code – Evaluation Criteria Metadata</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <label className="block">Max chars
                    <input type="number"
                      value={q.evaluation_meta?.max_chars ?? 2000}
                      onChange={e=>updateQ(i,{ evaluation_meta:{ ...q.evaluation_meta, max_chars: parseInt(e.target.value||'0') }})}
                      className="w-full mt-1 bg-black/40 border border-zinc-700 rounded-lg px-2 py-2"/>
                  </label>
                  <label className="flex items-center gap-2 mt-6">
                    <input type="checkbox"
                      checked={q.evaluation_meta?.require_for_loop ?? false}
                      onChange={e=>updateQ(i,{ evaluation_meta:{ ...q.evaluation_meta, require_for_loop: e.target.checked }})}/>
                    require 'for' loop
                  </label>
                  <label className="block">require_function_name
                    <input
                      value={q.evaluation_meta?.require_function_name ?? ''}
                      onChange={e=>updateQ(i,{ evaluation_meta:{ ...q.evaluation_meta, require_function_name: e.target.value || null }})}
                      placeholder="ex: solve"
                      className="w-full mt-1 bg-black/40 border border-zinc-700 rounded-lg px-2 py-2"/>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
