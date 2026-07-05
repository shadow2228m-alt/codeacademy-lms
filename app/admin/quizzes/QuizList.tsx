'use client'
import { useState, useTransition } from 'react'
import { deleteQuizAdmin, updateQuizMeta } from '@/app/admin/quizzes/actions'

type QuizRow = {
  id: string
  title: string
  duration_minutes: number
  total_score: number
  created_at: string
  questions?: { count: number }[]
}

export default function QuizList({ initialQuizzes }:{ initialQuizzes: QuizRow[] }){
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string|null>(null)

  const remove = (id: string, title: string) => {
    if (!confirm(`متأكد من حذف اختبار "${title}"؟ سيتم حذف كل أسئلته ومحاولات الطلاب المرتبطة به.`)) return
    setMsg(null)
    startTransition(async () => {
      try {
        await deleteQuizAdmin(id)
        setQuizzes(qs => qs.filter(q => q.id !== id))
      } catch (e: any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  if (quizzes.length === 0) {
    return <div className="text-zinc-500 text-sm">لا توجد اختبارات منشأة بعد. استخدم Quiz Composer أدناه لإنشاء أول اختبار.</div>
  }

  return (
    <div className="space-y-3">
      {msg && <div className="text-sm text-red-400">{msg}</div>}
      {quizzes.map(q => (
        editingId === q.id ? (
          <EditQuizRow key={q.id} quiz={q} onCancel={()=>setEditingId(null)}
            onSaved={(patch)=>{ setQuizzes(qs=>qs.map(x=>x.id===q.id?{...x,...patch}:x)); setEditingId(null) }} />
        ) : (
          <div key={q.id} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div>
              <div className="font-bold text-cyan-200">{q.title}</div>
              <div className="text-xs text-zinc-400 mt-1">
                {q.duration_minutes} دقيقة • {q.total_score} نقطة • {q.questions?.[0]?.count ?? 0} سؤال
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setEditingId(q.id)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">تعديل</button>
              <button disabled={isPending} onClick={()=>remove(q.id, q.title)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50">حذف</button>
            </div>
          </div>
        )
      ))}
    </div>
  )
}

function EditQuizRow({ quiz, onCancel, onSaved }:{
  quiz: QuizRow
  onCancel: () => void
  onSaved: (patch: Partial<QuizRow>) => void
}) {
  const [title, setTitle] = useState(quiz.title)
  const [duration, setDuration] = useState(quiz.duration_minutes)
  const [totalScore, setTotalScore] = useState(quiz.total_score)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string|null>(null)

  const save = () => {
    setMsg(null)
    startTransition(async () => {
      try {
        await updateQuizMeta(quiz.id, { title, duration_minutes: Number(duration), total_score: Number(totalScore) })
        onSaved({ title, duration_minutes: Number(duration), total_score: Number(totalScore) })
      } catch (e: any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-zinc-950/70 p-4">
      <div className="grid md:grid-cols-3 gap-2 mb-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="md:col-span-3 bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
        <div>
          <label className="text-xs text-zinc-400">Duration (min)</label>
          <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value||'0'))} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm mt-1"/>
        </div>
        <div>
          <label className="text-xs text-zinc-400">Total Points</label>
          <input type="number" value={totalScore} onChange={e=>setTotalScore(parseInt(e.target.value||'0'))} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm mt-1"/>
        </div>
      </div>
      <div className="flex gap-2">
        <button disabled={isPending} onClick={save} className="px-4 py-2 rounded-lg bg-cyan-500 text-black text-sm font-bold disabled:opacity-50">{isPending?'يحفظ…':'حفظ'}</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300">إلغاء</button>
      </div>
      <div className="text-[11px] text-zinc-500 mt-2">ملاحظة: تعديل العنوان/المدة/الدرجة الكلية فقط. لتعديل الأسئلة احذف الاختبار وأنشئه من جديد.</div>
      {msg && <div className="text-xs mt-2 text-red-400">{msg}</div>}
    </div>
  )
}
