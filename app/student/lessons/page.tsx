import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SandboxClient from './SandboxClient'

export const metadata = { title: 'CodeAcademy | الدروس التفاعلية' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Attachment = { name: string; url: string; type: string }

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
            <Link key={c.id} href={`/student/lessons?course=${c.slug}`} className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 hover:border-cyan-500/40 transition hover:shadow-[0_0_30px_rgba(0,234,255,0.06)]">
              <div className="text-xl font-bold text-white group-hover:text-cyan-200 transition">{c.title}</div>
              <div className="text-sm text-zinc-400 mt-2">{c.description}</div>
              <div className="mt-4 text-xs text-zinc-600 font-mono">{c.level === 'beginner' ? '🟢 مبتدئ' : c.level === 'intermediate' ? '🟡 متوسط' : '🔴 متقدم'}</div>
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

  const pdfAttachments: Attachment[] = Array.isArray(activeLesson?.attachments)
    ? activeLesson.attachments.filter((a: any) => a.type === 'pdf')
    : []

  return (
    <div className="max-w-[1350px] mx-auto px-5 py-8">
      <h1 className="text-2xl font-black text-white mb-6">{course.title}</h1>
      <div className="grid grid-cols-12 gap-5">
        {/* قائمة الدروس */}
        <aside className="col-span-12 xl:col-span-4 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="font-bold mb-2">دروس الكورس</div>
            <ul className="space-y-2 text-sm">
              {(lessons ?? []).map((l:any, i:number)=>{
                const isActive = l.id === (activeLesson?.id)
                const hasPdf = Array.isArray(l.attachments) && l.attachments.some((a:any) => a.type === 'pdf')
                return (
                  <li key={l.id}>
                    <Link
                      href={`/student/lessons?course=${courseSlug}&lesson=${l.id}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border transition ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
                          : 'border-zinc-800 hover:border-cyan-500/30 text-zinc-300'
                      }`}
                    >
                      <span>{i+1}. {l.title}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {hasPdf && <span className="text-[10px] text-amber-400" title="يحتوي على PDF">📎</span>}
                        {l.video_url && <span className="text-[10px] text-cyan-500" title="يحتوي على فيديو">🎥</span>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* محتوى الدرس */}
        <section className="col-span-12 xl:col-span-8 space-y-5">
          {/* الفيديو */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-cyan-300 font-bold">{activeLesson?.title || 'الدرس'}</div>
              <div className="text-xs text-zinc-500 mt-2">{activeLesson?.video_url || ''}</div>
            </div>
          </div>

          {/* المرفقات PDF */}
          {pdfAttachments.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
              <div className="text-xs text-amber-400 font-bold mb-3">📎 مرفقات الدرس</div>
              <div className="flex flex-wrap gap-2">
                {pdfAttachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm font-bold hover:bg-amber-500/20 transition"
                  >
                    <span>📄</span>
                    <span>{att.name}</span>
                    <span className="text-amber-500 text-xs">↓ تحميل</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* المحتوى النصي */}
          {activeLesson?.content_md && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-7 whitespace-pre-wrap">
                {activeLesson.content_md}
              </div>
            </div>
          )}

          {/* Python Sandbox */}
          <div className="rounded-2xl border border-cyan-500/20 bg-zinc-950/60 p-4">
            <SandboxClient />
          </div>
        </section>
      </div>
    </div>
  )
}
