import Link from 'next/link'
import LandingHero from '@/components/LandingHero'

export const metadata = {
  title: 'CodeAcademy — منصة التعلم التفاعلي',
  description: 'منصة CodeAcademy — تعلّم البرمجة بأسلوب مختلف. اختبارات ذكية، تصحيح آلي بـ Gemini AI، لوحة متصدرين تنافسية.',
  robots: { index: true, follow: true },
}

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white overflow-x-hidden" style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}>
      {/* Hero — client component handles animations */}
      <LandingHero />
    </main>
  )
}
