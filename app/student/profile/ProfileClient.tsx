'use client'
import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileClient({ initialName, userId }:{ initialName:string, userId:string }){
  const [name,setName]=useState(initialName)
  const [msg,setMsg]=useState<string|null>(null)
  const [isPending,startTransition]=useTransition()
  const save=()=>{
    startTransition(async()=>{
      const supabase = createClient()
      const { error } = await supabase.from('student_profiles').update({ full_name: name, updated_at: new Date().toISOString() }).eq('user_id', userId)
      setMsg(error ? '❌ '+error.message : '✅ تم الحفظ')
    })
  }
  return (
    <div className="mt-5 border-t border-zinc-800 pt-4">
      <label className="text-xs text-zinc-400">تعديل الاسم</label>
      <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 text-sm"/>
      <button disabled={isPending} onClick={save} className="w-full mt-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm">
        {isPending?'يحفظ…':'حفظ التغييرات'}
      </button>
      {msg && <div className="text-xs mt-2 text-amber-300">{msg}</div>}
    </div>
  )
}
