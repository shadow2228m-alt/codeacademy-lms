'use client'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import CodeSandbox from './CodeSandbox'
import { upsertStudentAnswer, submitAndGradeQuiz } from '@/app/student/quizzes/actions'

type Q = {
  id: string
  q_type: 'multiple_choice'|'essay_code'
  question_text: string
  options: any
  max_points: number
  order_index: number
}

export default function ExamArena({ quiz, questions, attempt }:{
  quiz: { id:string, title:string, duration_minutes:number, total_score:number }
  questions: Q[]
  attempt: { id:string, started_at:string, status:string }
}) {
  const [answers, setAnswers] = useState<Record<string, {selected_option?:string|null, written_code?:string}>>({})
  const [remaining, setRemaining] = useState<number>(0)
  const [saving, setSaving] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [terminal, setTerminal] = useState('>>> جاهز للتشغيل')
  const timers = useRef<Record<string, any>>({})
  const [isPending, startTransition] = useTransition()

  const endAt = useMemo(()=> new Date(new Date(attempt.started_at).getTime() + quiz.duration_minutes*60*1000).getTime(), [attempt.started_at, quiz.duration_minutes])

  useEffect(()=>{
    const t = setInterval(()=>{
      const r = Math.max(0, Math.floor((endAt - Date.now())/1000))
      setRemaining(r)
      if (r===0) { clearInterval(t); autoSubmit() }
    }, 1000)
    return ()=>clearInterval(t)
    // eslint-disable-next-line
  }, [endAt])

  const mm = String(Math.floor(remaining/60)).padStart(2,'0')
  const ss = String(remaining%60).padStart(2,'0')
  const danger = remaining>0 && remaining < 5*60

  function queueSave(qid:string, payload:any){
    if (timers.current[qid]) clearTimeout(timers.current[qid])
    // 500ms debouncing state auto-saver
    timers.current[qid] = setTimeout(async ()=>{
      setSaving(qid)
      try {
        // localStorage network disconnection fallback
        localStorage.setItem(`ca_answer_${attempt.id}_${qid}`, JSON.stringify(payload))
        await upsertStudentAnswer({
          attempt_id: attempt.id,
          question_id: qid,
          selected_option: payload.selected_option ?? null,
          written_code: payload.written_code ?? null
        })
        // sync ok -> clear local
        localStorage.removeItem(`ca_answer_${attempt.id}_${qid}`)
      } catch(e:any){
        // keep in localStorage for later sync
      } finally {
        setSaving(null)
      }
    }, 500)
  }

  // re-hydrate localStorage (network disconnection recovery)
  useEffect(()=>{
    const recovered: any = {}
    questions.forEach(q=>{
      const ls = localStorage.getItem(`ca_answer_${attempt.id}_${q.id}`)
      if (ls) { try { recovered[q.id] = JSON.parse(ls) } catch{} }
    })
    if (Object.keys(recovered).length) setAnswers(a=>({...recovered, ...a}))
    // eslint-disable-next-line
  }, [])

  const autoSubmit = () => {
    if (result) return
    startTransition(async ()=>{
      const r = await submitAndGradeQuiz(attempt.id)
      setResult(r)
    })
  }

  return (
    <div dir="rtl" className="grid grid-cols-12 gap-5">
      <div className="col-span-12 flex items-center justify-between">
        <h2 className="text-xl font-bold text-cyan-200">{quiz.title}</h2>
        <div className={`px-5 py-2 rounded-2xl font-mono text-lg border transition-all ${danger ? 'border-red-500 text-red-400 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.35)]' : 'border-cyan-400/40 text-cyan-300 shadow-[0_0_18px_rgba(0,255,255,0.18)]'}`} style={{ direction:'ltr' }}>
          ⏱ {mm}:{ss}
        </div>
      </div>

      <div className="col-span-12 space-y-6">
        {questions.map((q, idx)=>(
          <div key={q.id} className={`rounded-2xl p-5 border ${danger ? 'border-red-500/40' : 'border-zinc-800'} bg-zinc-950/70`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-zinc-300">سؤال {idx+1} • {q.max_points} نقطة • <span className={q.q_type==='multiple_choice'?'text-cyan-300':'text-fuchsia-300'}>{q.q_type}</span></div>
              <div className="text-xs text-zinc-500">{saving===q.id ? 'يحفظ…' : 'auto-save 500ms'}</div>
            </div>
            <p className="mb-4 text-[15px] leading-7">{q.question_text}</p>

            {q.q_type==='multiple_choice' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['A','B','C','D'] as const).map(opt=>{
                  const checked = answers[q.id]?.selected_option === opt
                  return (
                    <label key={opt} className={`cursor-pointer px-4 py-3 rounded-xl border transition ${checked ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200' : 'border-zinc-800 hover:border-zinc-600 bg-black/30'}`}>
                      <input type="radio" name={q.id} className="ml-2"
                        checked={checked}
                        onChange={()=>{
                          const payload = { selected_option: opt }
                          setAnswers(a=>({...a, [q.id]: {...a[q.id], ...payload}}))
                          queueSave(q.id, payload)
                        }}/>
                      <span className="font-bold ml-2">{opt}.</span> {q.options?.[opt] ?? ''}
                    </label>
                  )
                })}
              </div>
            ) : (
              <div>
                <CodeSandbox
                  value={answers[q.id]?.written_code ?? ''}
                  onChange={v=>{
                    const payload = { written_code: v }
                    setAnswers(a=>({...a, [q.id]: {...a[q.id], ...payload}}))
                    queueSave(q.id, payload)
                  }}
                  onRun={(code)=>{
                    setTerminal('>>> Running...\n' + code.slice(0,400) + (code.length>400?'...\n':'\n') + '✓ Syntax OK (simulated)')
                  }}
                />
                <div className="mt-3 text-[12px] bg-black/40 border border-zinc-800 rounded-xl p-3 text-emerald-300 font-mono whitespace-pre-wrap" dir="ltr">{terminal}</div>
              </div>
            )}
          </div>
        ))}

        {!result ? (
          <button onClick={autoSubmit} disabled={isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-black text-lg disabled:opacity-50">
            {isPending ? 'يصحح عبر Gemini AI...' : 'تسليم وتصحيح آلي'}
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="text-emerald-300 font-bold text-lg">تم التصحيح ✅</div>
            <div className="mt-2 text-2xl font-black">{result.score_achieved} / {quiz.total_score}</div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-zinc-300 leading-7" dir="rtl">{result.ai_feedback}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
