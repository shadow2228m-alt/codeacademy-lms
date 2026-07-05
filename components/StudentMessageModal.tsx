'use client'
import { useState, useTransition, useEffect } from 'react'
import { dismissMessage } from '@/app/admin/students/actions'

type AdminMessage = {
  id: string
  title: string
  message: string
  created_at: string
}

export default function StudentMessageModal({ messages: initialMessages }: { messages: AdminMessage[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [current, setCurrent] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [visible, setVisible] = useState(initialMessages.length > 0)

  // إعادة الفحص عند تغيير الرسائل الأولية
  useEffect(() => {
    setMessages(initialMessages)
    setVisible(initialMessages.length > 0)
    setCurrent(0)
  }, [initialMessages])

  if (!visible || messages.length === 0) return null

  const msg = messages[current]
  if (!msg) return null

  const handleDismiss = () => {
    startTransition(async () => {
      await dismissMessage(msg.id)
      const remaining = messages.filter(m => m.id !== msg.id)
      setMessages(remaining)
      if (remaining.length === 0) {
        setVisible(false)
      } else {
        setCurrent(Math.min(current, remaining.length - 1))
      }
    })
  }

  return (
    // لا يُغلق عند النقر خارجه — intentional per spec
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      dir="rtl"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md mx-4 rounded-[28px] border border-cyan-500/40 bg-[#08101e] shadow-[0_0_80px_rgba(0,234,255,0.2)] overflow-hidden">
        {/* شريط علوي */}
        <div className="px-6 pt-5 pb-3 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-black text-xs">CA</div>
              <div className="text-xs text-cyan-300 font-bold">رسالة من الإدارة</div>
            </div>
            {messages.length > 1 && (
              <div className="text-xs text-zinc-500">{current + 1} / {messages.length}</div>
            )}
          </div>
        </div>

        {/* محتوى الرسالة */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-black text-white mb-3">{msg.title}</h2>
          <p className="text-zinc-300 leading-7 whitespace-pre-wrap text-sm">{msg.message}</p>
          <div className="text-xs text-zinc-600 mt-4">
            {new Date(msg.created_at).toLocaleString('ar-EG')}
          </div>
        </div>

        {/* أزرار التنقل والإغلاق */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          {messages.length > 1 && (
            <div className="flex gap-2">
              <button
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs disabled:opacity-30 hover:border-zinc-500 transition"
              >
                السابق
              </button>
              <button
                disabled={current === messages.length - 1}
                onClick={() => setCurrent(c => c + 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs disabled:opacity-30 hover:border-zinc-500 transition"
              >
                التالي
              </button>
            </div>
          )}
          <button
            disabled={isPending}
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black font-bold text-sm disabled:opacity-60 hover:opacity-90 transition"
          >
            {isPending ? 'جارٍ الإغلاق…' : messages.length > 1 ? 'قرأت هذه الرسالة ✓' : 'حسناً، تم القراءة ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
