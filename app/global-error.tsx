'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#05070f] text-white min-h-screen flex items-center justify-center px-6" style={{fontFamily:'Cairo, system-ui'}}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h1>
          <p className="text-zinc-400 mb-2">نعتذر، حدثت مشكلة أثناء تحميل الصفحة.</p>
          {error?.digest && (
            <p className="text-zinc-600 text-xs mb-6">Digest: {error.digest}</p>
          )}
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold"
          >
            حاول مرة أخرى
          </button>
        </div>
      </body>
    </html>
  )
}
