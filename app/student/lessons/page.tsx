import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SandboxClient from './SandboxClient'

export const metadata = { title: 'CodeAcademy | Lessons Arena' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LessonsPage({ searchParams }:{ searchParams?: Promise<{ course?: string, lesson?: string }>}) {
  const supabase = await createClient()
  const sp = await searchParams
  const courseSlug = sp?.course
  const lessonId = sp?.lesson
  const { data: courses } = await supabase.from('courses').select('*').eq('is_published', true).order('created_at')
  if (!courseSlug) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-cyan-300">الدروس التفاعلية</h1>
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {(courses ?? []).map((c:any)=>(
            <Link key={c.id} href={`/student/lessons?course=${c.slug}`} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 hover:border-cyan-500/40 transition">
              <div className="text-xl font-bold text-white">{c.title}</div>
              <div className="text-sm text-zinc-400 mt-2">{c.description}</div>
            </Link>
          ))}
        </div>
      </div>
    )
  }
  const course = (courses ?? []).find((c:any)=>c.slug===courseSlug)
  if (!course) return <div className="p-10 text-center text-zinc-400">الكورس غير موجود.</div>
  const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', course.id).order('order_index')
  const activeLesson = lessonId ? (lessons ?? []).find((l:any)=>l.id===lessonId) : (lessons ?? [])[0]
  return (
    <div className="max-w-[1350px] mx-auto px-5 py-8">
      <h1 className="text-2xl font-black text-white mb-6">{course.title}</h1>
      <div className="grid grid-cols-12 gap-5">
        <aside className="col-span-12 xl:col-span-4 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="font-bold mb-2">دروس الكورس</div>
            <ul className="space-y-2 text-sm">
              {(lessons ?? []).map((l:any, i:number)=>(
                <li key={l.id}>
                  <Link href={`/student/lessons?course=${courseSlug}&lesson=${l.id}`} className="block px-3 py-2 rounded-xl border border-zinc-800 hover:border-cyan-500/40">
                    {i+1}. {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className="col-span-12 xl:col-span-8 space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-cyan-300">{activeLesson?.title || 'الدرس'}</div>
              <div className="text-xs text-zinc-500 mt-2">{activeLesson?.video_url || ''}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-zinc-950/60 p-4">
            <SandboxClient />
          </div>
        </section>
      </div>
    </div>
  )
}
