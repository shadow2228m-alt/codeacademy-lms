'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitAndGradeQuiz } from './actions'

export default function RetryGradingButton({ attemptId }: { attemptId: string }) {
  const [isPending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  const retry = () => {
    setErr(null)
    startTransition(async () => {
      try {
        await submitAndGradeQuiz(attemptId)
        router.refresh()
      } catch (e: any) {
        setErr(e.message || 'فشلت إعادة التصحيح، حاول مرة أخرى.')
      }
    })
  }

  return (
    <div className="mt-4">
      <button disabled={isPending} onClick={retry}
        className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold disabled:opacity-50">
        {isPending ? 'جارٍ إعادة المحاولة…' : 'إعادة محاولة التصحيح'}
      </button>
      {err && <div className="text-red-400 text-xs mt-2">{err}</div>}
    </div>
  )
}
