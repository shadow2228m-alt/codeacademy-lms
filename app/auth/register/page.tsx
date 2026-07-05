'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage(){
  const [fullName,setFullName]=useState('طالب CodeAcademy')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState<string|null>(null)
  const [ok,setOk]=useState(false)
  const [isPending,startTransition]=useTransition()
  const router=useRouter()

  const submit=()=>{
    setErr(null)
    if (!fullName.trim()) { setErr('من فضلك أدخل الاسم الكامل'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('البريد الإلكتروني غير صالح'); return }
    if (password.length < 6) { setErr('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    startTransition(async()=>{
      const supabase=createClient()
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: 'student' } }
      })
      if(error){ setErr(error.message); return }
      // create profile row
      if(data.user){
        await supabase.from('student_profiles').upsert({
          user_id: data.user.id,
          full_name: fullName
        }, { onConflict: 'user_id' })
      }
      setOk(true)
      setTimeout(()=>router.push('/auth/login'),1200)
    })
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-6" style={{fontFamily:'Cairo'}}>
      <div className="w-full max-w-md rounded-[28px] border border-fuchsia-500/25 bg-zinc-950/80 p-8 neon-border">
        <h1 className="text-3xl font-black text-fuchsia-300 neon-text mb-2">إنشاء حساب طالب</h1>
        <p className="text-zinc-400 mb-6">انضم لمنصة CodeAcademy الفاخرة</p>
        <label className="text-sm">الاسم الكامل</label>
        <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full mt-1 mb-3 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-fuchsia-500"/>
        <label className="text-sm">البريد</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 mb-3 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-fuchsia-500"/>
        <label className="text-sm">كلمة المرور</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mt-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-fuchsia-500"/>
        {err && <div className="text-red-400 text-sm mt-3">{err}</div>}
        {ok && <div className="text-emerald-400 text-sm mt-3">تم إنشاء الحساب ✅ سيتم تحويلك…</div>}
        <button disabled={isPending} onClick={submit} className="w-full mt-5 py-3.5 rounded-xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black">
          {isPending ? 'جارٍ التسجيل…' : 'تسجيل'}
        </button>
        <div className="text-xs text-zinc-500 mt-4 text-center">
          لديك حساب؟ <Link href="/auth/login" className="text-cyan-400">دخول</Link>
        </div>
      </div>
    </main>
  )
}
