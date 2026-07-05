'use client'
import { useEffect, useRef } from 'react'

export default function CodeSandbox({ value, onChange, onRun }:{
  value: string
  onChange: (v:string)=>void
  onRun?: (code:string)=>void
}) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const lines = value.split('\n').length

  useEffect(()=>{
    const ta = taRef.current; if(!ta) return
    ta.style.height='auto'
    ta.style.height = Math.max(320, ta.scrollHeight)+'px'
  },[value])

  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#0b0f1a]" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-black/30 text-xs text-zinc-400">
        <span>Python IDE • CodeAcademy Sandbox <span className="text-amber-400/80">(معاينة تجريبية)</span></span>
        <button onClick={()=>onRun?.(value)} className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Run ▶</button>
      </div>
      <div className="flex">
        <pre className="select-none text-right px-3 py-3 text-[12px] text-zinc-600 bg-black/20 leading-6" style={{fontFamily:'ui-monospace, SFMono-Regular, monospace'}}>
{Array.from({length: Math.max(lines,18)}, (_,i)=> i+1).join('\n')}
        </pre>
        <textarea
          ref={taRef}
          value={value}
          onChange={e=>onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent outline-none p-3 text-[13px] leading-6 text-cyan-100"
          style={{fontFamily:'ui-monospace, SFMono-Regular, monospace', minHeight: '340px'}}
          placeholder="# اكتب كود Python هنا
def solve():
    pass"
        />
      </div>
      <div className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-500">
        محاكاة تشغيل تجريبية (ليست بيئة تنفيذ Python فعلية) • auto-format • line numbering enabled
      </div>
    </div>
  )
}
