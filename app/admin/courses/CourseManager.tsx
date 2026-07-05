'use client'
import { useState, useTransition, useRef } from 'react'
import {
  createCourse, updateCourse, deleteCourse,
  createLesson, updateLesson, deleteLesson
} from '@/app/admin/courses/actions'
import { createClient } from '@/lib/supabase/client'

type Attachment = { name: string; url: string; type: string }

async function uploadPDF(file: File, lessonTitle: string): Promise<Attachment> {
  const supabase = createClient()
  const safeName = lessonTitle.trim().replace(/\s+/g, '-').slice(0, 40)
  const path = `${safeName}-${Date.now()}.pdf`
  const { error } = await supabase.storage.from('lesson-pdfs').upload(path, file, { upsert: true })
  if (error) throw new Error('فشل رفع PDF: ' + error.message)
  const { data: { publicUrl } } = supabase.storage.from('lesson-pdfs').getPublicUrl(path)
  return { name: file.name, url: publicUrl, type: 'pdf' }
}

export default function CourseManager({ initialCourses }:{ initialCourses:any[] }){
  const [courses, setCourses] = useState(initialCourses)
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [desc,setDesc]=useState('')
  const [level,setLevel]=useState('beginner')
  const [isPending, startTransition]=useTransition()
  const [msg, setMsg] = useState<string|null>(null)

  const addCourse = ()=>{
    setMsg(null)
    startTransition(async()=>{
      try {
        await createCourse({ title, slug, description: desc, level })
        setTitle(''); setSlug(''); setDesc(''); setLevel('beginner')
        location.reload()
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6" dir="rtl">
      <div className="rounded-2xl border border-fuchsia-500/20 bg-zinc-950/70 p-5 h-fit">
        <div className="font-bold text-fuchsia-300 mb-3">كورس جديد</div>
        <input placeholder="العنوان" value={title} onChange={e=>{setTitle(e.target.value); setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g,'-'))}} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <input placeholder="الرابط الفرعي (slug)" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <textarea placeholder="الوصف" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-3">
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدم</option>
        </select>
        <button disabled={isPending||!title||!slug} onClick={addCourse} className="w-full py-2.5 rounded-xl bg-fuchsia-500 text-black font-bold disabled:opacity-50">
          {isPending ? 'جارٍ الإنشاء…' : 'إنشاء'}
        </button>
        {msg && <div className="text-xs mt-2 text-red-400">{msg}</div>}
      </div>

      <div className="lg:col-span-2 space-y-4">
        {courses.map((c:any)=>(
          <CourseCard key={c.id} course={c} onDeleted={(id)=>setCourses(cs=>cs.filter(x=>x.id!==id))} />
        ))}
        {courses.length===0 && <div className="text-zinc-500">لا كورسات بعد</div>}
      </div>
    </div>
  )
}

function CourseCard({ course, onDeleted }:{course:any, onDeleted:(id:string)=>void}){
  const [open,setOpen]=useState(false)
  const [editing,setEditing]=useState(false)
  const [ltitle,setLtitle]=useState('')
  const [lvideo,setLvideo]=useState('')
  const [lcontent,setLcontent]=useState('')
  const [lpdfFile,setLpdfFile]=useState<File|null>(null)
  const [lpdfName,setLpdfName]=useState('')
  const [isPending,startTransition]=useTransition()
  const [msg,setMsg]=useState<string|null>(null)
  const pdfRef=useRef<HTMLInputElement>(null)

  const [eTitle,setETitle]=useState(course.title)
  const [eSlug,setESlug]=useState(course.slug)
  const [eDesc,setEDesc]=useState(course.description||'')
  const [eLevel,setELevel]=useState(course.level)

  const addLesson=()=>{
    setMsg(null)
    startTransition(async()=>{
      try {
        let attachments: Attachment[] = []
        if (lpdfFile) {
          attachments = [await uploadPDF(lpdfFile, ltitle)]
        }
        await createLesson({
          course_id: course.id,
          title: ltitle,
          video_url: lvideo || undefined,
          content_md: lcontent || undefined,
          order_index: (course.lessons?.length || 0),
          attachments,
        })
        setLtitle(''); setLvideo(''); setLcontent(''); setLpdfFile(null); setLpdfName('')
        location.reload()
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  const saveEdit = () => {
    setMsg(null)
    startTransition(async()=>{
      try {
        await updateCourse(course.id, { title: eTitle, slug: eSlug, description: eDesc, level: eLevel })
        setEditing(false)
        location.reload()
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  const togglePublish = () => {
    startTransition(async()=>{
      try {
        await updateCourse(course.id, { is_published: !course.is_published })
        location.reload()
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  const removeCourse = () => {
    if (!confirm(`متأكد من حذف كورس "${course.title}"؟ سيتم حذف كل دروسه أيضاً.`)) return
    startTransition(async()=>{
      try {
        await deleteCourse(course.id)
        onDeleted(course.id)
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  const removeLesson = (lessonId: string, lessonTitle: string) => {
    if (!confirm(`حذف الدرس "${lessonTitle}"؟`)) return
    startTransition(async()=>{
      try {
        await deleteLesson(lessonId)
        location.reload()
      } catch (e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-cyan-500/30 bg-zinc-950/60 p-5">
        <div className="font-bold text-cyan-300 mb-3">تعديل الكورس</div>
        <input value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="العنوان" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <input value={eSlug} onChange={e=>setESlug(e.target.value)} placeholder="الرابط الفرعي (slug)" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} placeholder="الوصف" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <select value={eLevel} onChange={e=>setELevel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-3 text-sm">
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدم</option>
        </select>
        <div className="flex gap-2">
          <button disabled={isPending} onClick={saveEdit} className="flex-1 py-2 rounded-lg bg-cyan-500 text-black font-bold text-sm disabled:opacity-50">
            {isPending?'يحفظ…':'حفظ'}
          </button>
          <button onClick={()=>setEditing(false)} className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm">إلغاء</button>
        </div>
        {msg && <div className="text-xs mt-2 text-red-400">{msg}</div>}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg text-cyan-200">{course.title}</div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${course.is_published ? 'border-emerald-500/40 text-emerald-300' : 'border-zinc-600 text-zinc-400'}`}>
              {course.is_published ? 'منشور' : 'مسودة'}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">{course.slug} • {course.level === 'beginner' ? 'مبتدئ' : course.level === 'intermediate' ? 'متوسط' : 'متقدم'}</div>
          <div className="text-sm text-zinc-300 mt-2">{course.description}</div>
        </div>
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          <button onClick={()=>setOpen(!open)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-cyan-500/40">{open?'إغلاق':'إدارة الدروس'}</button>
          <div className="flex gap-1.5">
            <button onClick={()=>setEditing(true)} className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">تعديل</button>
            <button disabled={isPending} onClick={togglePublish} className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50">
              {course.is_published ? 'إخفاء' : 'نشر'}
            </button>
            <button disabled={isPending} onClick={removeCourse} className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50">حذف</button>
          </div>
        </div>
      </div>
      <div className="text-xs text-zinc-500 mt-3">{course.lessons?.length || 0} درس</div>
      {msg && <div className="text-xs mt-2 text-red-400">{msg}</div>}
      {open && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            <input placeholder="عنوان الدرس" value={ltitle} onChange={e=>setLtitle(e.target.value)} className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
            <input placeholder="رابط الفيديو (video_url)" value={lvideo} onChange={e=>setLvideo(e.target.value)} className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
            <textarea placeholder="المحتوى بـ Markdown (content_md)" value={lcontent} onChange={e=>setLcontent(e.target.value)} className="md:col-span-2 bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
            {/* حقل رفع PDF */}
            <div className="md:col-span-2">
              <div
                className="flex items-center gap-3 border border-dashed border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-cyan-500/50 transition text-sm"
                onClick={() => pdfRef.current?.click()}
              >
                <span className="text-zinc-400">📎</span>
                <span className="text-zinc-400">{lpdfName || 'رفع ملف PDF اختياري (حد أقصى 20MB)'}</span>
                {lpdfName && <button className="text-red-400 text-xs mr-auto" onClick={e=>{e.stopPropagation();setLpdfFile(null);setLpdfName('')}}>✕</button>}
              </div>
              <input
                ref={pdfRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e=>{
                  const f=e.target.files?.[0]
                  if (f && f.size <= 20*1024*1024) { setLpdfFile(f); setLpdfName(f.name) }
                  else if (f) setMsg('❌ الملف أكبر من 20MB')
                }}
              />
            </div>
          </div>
          <button disabled={isPending||!ltitle} onClick={addLesson} className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm disabled:opacity-50">
            {isPending ? 'جارٍ الإضافة…' : '+ إضافة درس'}
          </button>

          <ul className="mt-4 space-y-2 text-sm">
            {(course.lessons||[]).map((l:any)=>(
              <LessonRow key={l.id} lesson={l} onDelete={()=>removeLesson(l.id, l.title)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, onDelete }:{ lesson:any, onDelete:()=>void }){
  const [editing,setEditing]=useState(false)
  const [title,setTitle]=useState(lesson.title)
  const [video,setVideo]=useState(lesson.video_url||'')
  const [content,setContent]=useState(lesson.content_md||'')
  const [pdfFile,setPdfFile]=useState<File|null>(null)
  const [pdfName,setPdfName]=useState('')
  const [isPending,startTransition]=useTransition()
  const [msg,setMsg]=useState<string|null>(null)
  const pdfRef=useRef<HTMLInputElement>(null)

  const save = () => {
    setMsg(null)
    startTransition(async()=>{
      try {
        let attachments: Attachment[] | undefined = undefined
        if (pdfFile) {
          attachments = [await uploadPDF(pdfFile, title)]
        }
        await updateLesson(lesson.id, {
          title,
          video_url: video || undefined,
          content_md: content || undefined,
          ...(attachments ? { attachments } : {}),
        })
        setEditing(false)
        location.reload()
      } catch(e:any) {
        setMsg('❌ ' + e.message)
      }
    })
  }

  if (editing) {
    return (
      <li className="bg-black/30 px-3 py-3 rounded-lg border border-cyan-900/50">
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 mb-2 text-sm"/>
        <input value={video} onChange={e=>setVideo(e.target.value)} placeholder="رابط الفيديو (video_url)" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 mb-2 text-sm"/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="المحتوى بـ Markdown (content_md)" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 mb-2 text-sm"/>
        <div
          className="flex items-center gap-2 border border-dashed border-zinc-700 rounded-lg px-2 py-1.5 mb-2 cursor-pointer hover:border-cyan-500/50 text-xs text-zinc-400"
          onClick={() => pdfRef.current?.click()}
        >
          📎 {pdfName || 'استبدال PDF (اختياري)'}
          {pdfName && <button className="text-red-400 mr-auto" onClick={e=>{e.stopPropagation();setPdfFile(null);setPdfName('')}}>✕</button>}
        </div>
        <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
          onChange={e=>{const f=e.target.files?.[0]; if(f&&f.size<=20*1024*1024){setPdfFile(f);setPdfName(f.name)} else if(f) setMsg('❌ الملف أكبر من 20MB')}}
        />
        <div className="flex gap-2">
          <button disabled={isPending} onClick={save} className="flex-1 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold disabled:opacity-50">{isPending?'يحفظ…':'حفظ'}</button>
          <button onClick={()=>setEditing(false)} className="flex-1 py-1.5 rounded-lg border border-zinc-700 text-xs">إلغاء</button>
        </div>
        {msg && <div className="text-xs mt-1.5 text-red-400">{msg}</div>}
      </li>
    )
  }

  const pdfs: Attachment[] = Array.isArray(lesson.attachments) ? lesson.attachments.filter((a:any) => a.type === 'pdf') : []

  return (
    <li className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg border border-zinc-900">
      <div>
        <span>#{lesson.order_index} {lesson.title}</span>
        {pdfs.length > 0 && <span className="text-[10px] text-amber-400 mr-2">📎 PDF</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs">{lesson.video_url ? '🎥' : '📄'}</span>
        <button onClick={()=>setEditing(true)} className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">تعديل</button>
        <button onClick={onDelete} className="text-[11px] px-2 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10">حذف</button>
      </div>
    </li>
  )
}
