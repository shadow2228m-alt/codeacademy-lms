'use client'
import { useState } from 'react'
import CodeSandbox from '@/components/CodeSandbox'

export default function SandboxClient(){
  const [code, setCode] = useState(`# CodeAcademy - Immersive Arena
# مرحباً بك في الـ Sandbox

def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a)
        a, b = b, a + b

fibonacci(8)
`)
  const [out, setOut] = useState('>>> Ready')
  return (
    <>
      <CodeSandbox value={code} onChange={setCode} onRun={(c)=> setOut('>>> executed\\n0\\n1\\n1\\n2\\n3\\n5\\n8\\n13\\n✓ Done')} />
      <div className="mt-3 rounded-xl bg-black border border-zinc-800 p-3 text-emerald-300 text-xs font-mono whitespace-pre" dir="ltr">{out}</div>
    </>
  )
}
