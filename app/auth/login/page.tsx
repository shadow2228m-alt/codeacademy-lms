'use client'
import React, { useState, useTransition, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const WHATSAPP_NUMBER = '201010752614'
const WHATSAPP_MSG = encodeURIComponent('مرحباً، أريد إعادة تعيين كلمة المرور الخاصة بحسابي في منصة CodeAcademy.')
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`

function LoginFormContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const sp = useSearchParams()
  const redirectTo = sp?.get('redirect') || '/student/dashboard'

  const submit = () => {
    setErr(null)
    if (!email.trim() || !password) { setErr('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return }
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErr('بيانات الدخول غير صحيحة، تأكد من بريدك وكلمة المرور'); return }
      router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <div className="w-full max-w-md rounded-[28px] border border-cyan-500/25 bg-zinc-950/80 p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
      {/* رأس البطاقة */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-black text-sm">CA</div>
        <div>
          <div className="font-black text-white">CodeAcademy</div>
          <div className="text-[10px] text-cyan-400 tracking-widest">منصة التعلم التفاعلي</div>
        </div>
      </div>

      <h1 className="text-3xl font-black text-cyan-300 mb-2">مرحباً بك</h1>
      <p className="text-zinc-400 mb-7 text-sm">سجّل الدخول للوصول لساحة الطلاب</p>

      <label className="text-sm text-zinc-300">البريد الإلكتروني</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="example@email.com"
        className="w-full mt-1 mb-4 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-sm"
        dir="ltr"
      />

      <label className="text-sm text-zinc-300">كلمة المرور</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="••••••••"
        className="w-full mt-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-sm"
      />

      {err && (
        <div className="mt-4 text-red-400 text-sm bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3">
          {err}
        </div>
      )}

      <button
        disabled={isPending}
        onClick={submit}
        className="w-full mt-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black disabled:opacity-60 hover:opacity-90 transition"
      >
        {isPending ? 'جارٍ الدخول…' : 'دخول آمن'}
      </button>

      {/* روابط سفلية */}
      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
        <Link href="/auth/register" className="text-cyan-400 hover:underline">
          إنشاء حساب طالب جديد
        </Link>
        {/* نسيت كلمة المرور → واتساب */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:underline flex items-center gap-1"
          id="forgot-password-whatsapp"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          نسيت كلمة المرور؟
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-6" style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}>
      <Suspense fallback={<div className="text-cyan-400">جارٍ التحميل…</div>}>
        <LoginFormContent />
      </Suspense>
    </main>
  )
}

export const dynamic = 'force-dynamic'
