'use client'
import { useState, useTransition } from 'react'
import { deleteStudent, addStudent, sendMessageToStudent } from '@/app/admin/students/actions'
import { grantBadge, revokeBadge } from '@/app/admin/students/badge-actions'
import { motion, AnimatePresence } from 'framer-motion'
import type { BadgeDefinition } from '@/lib/types'

type Student = {
  user_id: string
  full_name: string
  total_xp: number
  exams_passed: number
  accumulated_quiz_scores: number
  active_daily_streak: number
  last_submission_date: string | null
}

type StudentBadgeRow = {
  id: string
  badge_id: string
  badge_definitions: BadgeDefinition
}

type Props = {
  students: Student[]
  attemptCounts: Record<string, number>
  badgeDefinitions: BadgeDefinition[]
  studentBadgesMap: Record<string, StudentBadgeRow[]>
}

export default function AdminStudentsClient({ students: initialStudents, attemptCounts, badgeDefinitions, studentBadgesMap: initialBadgesMap }: Props) {
  const [students, setStudents] = useState(initialStudents)
  const [badgesMap, setBadgesMap] = useState(initialBadgesMap)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  // إضافة طالب
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newName, setNewName] = useState('')

  // رسالة
  const [msgTarget, setMsgTarget] = useState<string | null>(null)
  const [msgTitle, setMsgTitle] = useState('رسالة من الإدارة')
  const [msgBody, setMsgBody] = useState('')

  // شارات
  const [badgeTarget, setBadgeTarget] = useState<string | null>(null)

  const flash = (text: string, type: 'ok' | 'err') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleDelete = (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الطالب "${name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return
    startTransition(async () => {
      const res = await deleteStudent(userId)
      if (res.success) {
        setStudents(s => s.filter(x => x.user_id !== userId))
        flash('تم حذف الطالب بنجاح', 'ok')
      } else {
        flash(res.error || 'فشل الحذف', 'err')
      }
    })
  }

  const handleAdd = () => {
    if (!newEmail.trim() || !newPass.trim() || !newName.trim()) { flash('يرجى ملء جميع الحقول', 'err'); return }
    startTransition(async () => {
      const res = await addStudent({ email: newEmail, password: newPass, fullName: newName })
      if (res.success) {
        flash('تم إنشاء الحساب بنجاح ✅', 'ok')
        setNewEmail(''); setNewPass(''); setNewName(''); setShowAdd(false)
        setTimeout(() => window.location.reload(), 800)
      } else {
        flash(res.error || 'فشل الإنشاء', 'err')
      }
    })
  }

  const handleSendMessage = () => {
    if (!msgBody.trim()) { flash('يرجى كتابة نص الرسالة', 'err'); return }
    startTransition(async () => {
      const res = await sendMessageToStudent({ studentId: msgTarget!, title: msgTitle, message: msgBody })
      if (res.success) {
        flash('تم إرسال الرسالة بنجاح ✅', 'ok')
        setMsgTarget(null); setMsgBody(''); setMsgTitle('رسالة من الإدارة')
      } else {
        flash(res.error || 'فشل الإرسال', 'err')
      }
    })
  }

  const handleGrantBadge = (studentId: string, badgeId: string) => {
    startTransition(async () => {
      const res = await grantBadge(studentId, badgeId)
      if (res.success) {
        // تحديث الخريطة محلياً
        const def = badgeDefinitions.find(b => b.id === badgeId)
        if (def) {
          setBadgesMap(prev => ({
            ...prev,
            [studentId]: [...(prev[studentId] ?? []), { id: Date.now().toString(), badge_id: badgeId, badge_definitions: def }],
          }))
        }
        flash('تم منح الشارة ✅', 'ok')
      } else {
        flash(res.error || 'فشل منح الشارة', 'err')
      }
    })
  }

  const handleRevokeBadge = (studentId: string, studentBadgeId: string) => {
    startTransition(async () => {
      const res = await revokeBadge(studentBadgeId)
      if (res.success) {
        setBadgesMap(prev => ({
          ...prev,
          [studentId]: (prev[studentId] ?? []).filter(b => b.id !== studentBadgeId),
        }))
        flash('تم سحب الشارة', 'ok')
      } else {
        flash(res.error || 'فشل سحب الشارة', 'err')
      }
    })
  }

  return (
    <div dir="rtl">
      {/* شريط الإجراءات */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setShowAdd(s => !s)}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition"
        >
          {showAdd ? '✕ إغلاق' : '+ إضافة طالب جديد'}
        </button>
        <button
          onClick={() => setMsgTarget('all')}
          className="px-4 py-2 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-bold hover:bg-fuchsia-500/25 transition"
        >
          📢 رسالة جماعية لجميع الطلاب
        </button>
      </div>

      {/* إشعار النتيجة */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold ${msg.type === 'ok' ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300' : 'bg-red-950/50 border border-red-500/30 text-red-300'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج إضافة طالب */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-5 overflow-hidden"
          >
            <div className="font-bold text-emerald-300 mb-4">إضافة طالب جديد</div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">الاسم الكامل</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم الطالب"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">البريد الإلكتروني</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="example@email.com"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">كلمة المرور المؤقتة</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="6 أحرف على الأقل"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button disabled={isPending} onClick={handleAdd}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm disabled:opacity-50 hover:bg-emerald-400 transition">
              {isPending ? 'جارٍ الإنشاء…' : 'إنشاء الحساب'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* جدول الطلاب */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-right p-3">#</th>
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">النقاط (XP)</th>
              <th className="text-right p-3">ناجح</th>
              <th className="text-right p-3">مجموع الدرجات</th>
              <th className="text-right p-3">السلسلة اليومية 🔥</th>
              <th className="text-right p-3">المحاولات</th>
              <th className="text-right p-3">الشارات</th>
              <th className="text-right p-3">آخر تسليم</th>
              <th className="text-right p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => {
              const earned = badgesMap[s.user_id] ?? []
              return (
                <tr key={s.user_id} className="border-t border-zinc-900 hover:bg-zinc-950/60 transition">
                  <td className="p-3 text-zinc-500">{i + 1}</td>
                  <td className="p-3 font-bold text-white">{s.full_name}</td>
                  <td className="p-3 text-cyan-300 font-mono font-bold">{s.total_xp.toLocaleString('ar-EG')}</td>
                  <td className="p-3 text-emerald-300">{s.exams_passed}</td>
                  <td className="p-3 text-amber-300">{s.accumulated_quiz_scores}</td>
                  <td className="p-3">{s.active_daily_streak}</td>
                  <td className="p-3 text-zinc-300">{attemptCounts[s.user_id] || 0}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {earned.slice(0, 3).map(b => (
                        <span key={b.id} title={b.badge_definitions.name} className="text-base">{b.badge_definitions.emoji}</span>
                      ))}
                      {earned.length > 3 && <span className="text-[10px] text-zinc-500">+{earned.length - 3}</span>}
                      {earned.length === 0 && <span className="text-zinc-600 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400 text-xs">
                    {s.last_submission_date ? new Date(s.last_submission_date).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setBadgeTarget(s.user_id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition"
                      >🏅 شارة</button>
                      <button
                        onClick={() => setMsgTarget(s.user_id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 transition"
                      >رسالة</button>
                      <button
                        disabled={isPending}
                        onClick={() => handleDelete(s.user_id, s.full_name)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition"
                      >حذف</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center text-zinc-500 py-10">لا يوجد طلاب مسجلون بعد</div>
        )}
      </div>

      {/* مودال إرسال الرسالة */}
      <AnimatePresence>
        {msgTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-fuchsia-500/30 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(217,70,239,0.2)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-fuchsia-300 text-lg">
                  {msgTarget === 'all' ? 'رسالة جماعية لجميع الطلاب' : 'إرسال رسالة للطالب'}
                </h2>
                <button onClick={() => { setMsgTarget(null); setMsgBody('') }} className="text-zinc-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="mb-3">
                <label className="text-xs text-zinc-400 block mb-1">عنوان الرسالة</label>
                <input value={msgTitle} onChange={e => setMsgTitle(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-fuchsia-500" />
              </div>
              <div className="mb-4">
                <label className="text-xs text-zinc-400 block mb-1">نص الرسالة</label>
                <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={4}
                  placeholder="اكتب رسالتك هنا…"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-fuchsia-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button disabled={isPending} onClick={handleSendMessage}
                  className="flex-1 py-2.5 rounded-xl bg-fuchsia-500 text-black font-bold text-sm disabled:opacity-50 hover:bg-fuchsia-400 transition">
                  {isPending ? 'جارٍ الإرسال…' : '📨 إرسال'}
                </button>
                <button onClick={() => { setMsgTarget(null); setMsgBody('') }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال منح الشارات */}
      <AnimatePresence>
        {badgeTarget && (() => {
          const student = students.find(s => s.user_id === badgeTarget)
          const earned = badgesMap[badgeTarget] ?? []
          const earnedIds = earned.map(b => b.badge_id)
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              dir="rtl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(234,179,8,0.15)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-amber-300 text-lg">🏅 شارات الطالب: {student?.full_name}</h2>
                  <button onClick={() => setBadgeTarget(null)} className="text-zinc-400 hover:text-white text-xl">✕</button>
                </div>

                {/* الشارات الممنوحة */}
                {earned.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-zinc-400 mb-2">الشارات الحالية:</div>
                    <div className="flex flex-wrap gap-2">
                      {earned.map(b => (
                        <div key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10">
                          <span className="text-sm">{b.badge_definitions.emoji}</span>
                          <span className="text-xs font-bold text-amber-300">{b.badge_definitions.name}</span>
                          <button
                            disabled={isPending}
                            onClick={() => handleRevokeBadge(badgeTarget, b.id)}
                            className="text-red-400 hover:text-red-300 text-[10px] mr-1 disabled:opacity-50"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* منح شارة جديدة */}
                <div>
                  <div className="text-xs text-zinc-400 mb-2">منح شارة:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {badgeDefinitions.map(def => {
                      const alreadyEarned = earnedIds.includes(def.id)
                      return (
                        <button
                          key={def.id}
                          disabled={isPending || alreadyEarned}
                          onClick={() => handleGrantBadge(badgeTarget, def.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition ${
                            alreadyEarned
                              ? 'border-zinc-800 bg-black/20 text-zinc-600 cursor-not-allowed'
                              : 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-amber-500/50 hover:bg-amber-500/10'
                          }`}
                        >
                          <span className="text-xl">{def.emoji}</span>
                          <div className="text-right">
                            <div className="text-xs font-black" style={{ color: alreadyEarned ? undefined : def.color }}>{def.name}</div>
                            <div className="text-[10px] text-zinc-500">{def.description}</div>
                          </div>
                          {alreadyEarned && <span className="mr-auto text-emerald-500 text-xs">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button onClick={() => setBadgeTarget(null)} className="w-full mt-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 transition">
                  إغلاق
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
