'use client'
import React, { useState, useTransition, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const submit = () => {
    setErr(null)
    if (!email.trim() || !password) { setErr('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return }
    startTransition(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setErr('بيانات الدخول غير صحيحة'); return }
      const role = (data.user?.app_metadata as any)?.role ?? data.user?.user_metadata?.role
      if (role !== 'admin') {
        await supabase.auth.signOut()
        setErr('هذه البوابة مخصصة للمشرفين فقط')
        return
      }
      router.push('/admin/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="w-full max-w-sm rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-black text-sm">CA</div>
        <div>
          <div className="font-black text-white">CodeAcademy</div>
          <div className="text-[10px] text-amber-400 tracking-widest">بوابة الإدارة</div>
        </div>
      </div>
      <h1 className="text-xl font-black text-amber-300 mb-1">دخول المشرف</h1>
      <p className="text-zinc-500 text-sm mb-6">هذه البوابة مقيدة — للمشرفين المعتمدين فقط</p>
      <label className="text-sm text-zinc-400">البريد الإلكتروني</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        className="w-full mt-1 mb-4 bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"
      />
      <label className="text-sm text-zinc-400">كلمة المرور</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        className="w-full mt-1 bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500 text-sm"
      />
      {err && <div className="mt-4 text-red-400 text-sm bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3">{err}</div>}
      <button
        disabled={isPending}
        onClick={submit}
        className="w-full mt-5 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-black disabled:opacity-60 hover:opacity-90 transition"
      >
        {isPending ? 'جارٍ التحقق…' : 'دخول آمن'}
      </button>
    </div>
  )
}

export default function AdminSecretLoginPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-6"
      style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}
    >
      <Suspense fallback={<div className="text-amber-400">جارٍ التحميل…</div>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  )
}

export const dynamic = 'force-dynamic'
