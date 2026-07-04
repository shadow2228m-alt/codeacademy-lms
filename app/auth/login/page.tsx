'use client'
import React, { useState, useTransition, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginFormContent() {
  const [email, setEmail] = useState('admin@codeacademy.test')
  const [password, setPassword] = useState('Admin123!')
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const sp = useSearchParams()
  const redirect = sp?.get('redirect') || '/student/dashboard'
  const submit = () => {
    setErr(null)
    startTransition(async ()=>{
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErr(error.message); return }
      router.push(redirect)
      router.refresh()
    })
  }
  return (
    <div className="w-full max-w-md rounded-[28px] border border-cyan-500/25 bg-zinc-950/80 p-8">
        <h1 className="text-3xl font-black text-cyan-300 mb-2">CodeAcademy</h1>
        <p className="text-zinc-400 mb-7">تسجيل الدخول — منصة الاختبارات الديناميكية الفاخرة</p>
        <label className="text-sm text-zinc-300">البريد الإلكتروني</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 mb-4 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"/>
        <label className="text-sm text-zinc-300">كلمة المرور</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"/>
        {err && <div className="mt-4 text-red-400 text-sm">{err}</div>}
        <button disabled={isPending} onClick={submit} className="w-full mt-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black disabled:opacity-60">
          {isPending ? 'جارٍ الدخول…' : 'دخول آمن'}
        </button>
        <div className="text-xs text-zinc-500 mt-5 flex justify-between">
          <Link href="/auth/register" className="text-cyan-400 hover:underline">إنشاء حساب طالب</Link>
          <span>v2.3 • RLS • Gemini AI</span>
        </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-6" style={{fontFamily:'Cairo,system-ui'}}>
      <Suspense fallback={<div className="text-cyan-400">جاري تحميل بوابة الدخول...</div>}>
        <LoginFormContent />
      </Suspense>
    </main>
  )
}

export const dynamic = 'force-dynamic'
