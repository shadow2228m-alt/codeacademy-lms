'use client'
import { useState, useTransition } from 'react'
import {
  createCourse, updateCourse, deleteCourse,
  createLesson, updateLesson, deleteLesson
} from '@/app/admin/courses/actions'

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
        <input placeholder="Title" value={title} onChange={e=>{setTitle(e.target.value); setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g,'-'))}} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <input placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <textarea placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-3">
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="advanced">advanced</option>
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
  const [isPending,startTransition]=useTransition()
  const [msg,setMsg]=useState<string|null>(null)

  const [eTitle,setETitle]=useState(course.title)
  const [eSlug,setESlug]=useState(course.slug)
  const [eDesc,setEDesc]=useState(course.description||'')
  const [eLevel,setELevel]=useState(course.level)

  const addLesson=()=>{
    setMsg(null)
    startTransition(async()=>{
      try {
        await createLesson({
          course_id: course.id,
          title: ltitle,
          video_url: lvideo || undefined,
          content_md: lcontent || undefined,
          order_index: (course.lessons?.length || 0)
        })
        setLtitle(''); setLvideo(''); setLcontent('')
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
        <input value={eTitle} onChange={e=>setETitle(e.target.value)} placeholder="Title" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <input value={eSlug} onChange={e=>setESlug(e.target.value)} placeholder="slug" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} placeholder="description" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-2 text-sm"/>
        <select value={eLevel} onChange={e=>setELevel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 mb-3 text-sm">
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="advanced">advanced</option>
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
          <div className="text-xs text-zinc-400 mt-1">{course.slug} • {course.level}</div>
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
            <input placeholder="video_url" value={lvideo} onChange={e=>setLvideo(e.target.value)} className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
            <textarea placeholder="content_md" value={lcontent} onChange={e=>setLcontent(e.target.value)} className="md:col-span-2 bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button disabled={isPending||!ltitle} onClick={addLesson} className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm disabled:opacity-50">+ إضافة درس</button>

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
  const [isPending,startTransition]=useTransition()
  const [msg,setMsg]=useState<string|null>(null)

  const save = () => {
    setMsg(null)
    startTransition(async()=>{
      try {
        await updateLesson(lesson.id, { title, video_url: video || undefined, content_md: content || undefined })
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
        <input value={video} onChange={e=>setVideo(e.target.value)} placeholder="video_url" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 mb-2 text-sm"/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="content_md" className="w-full bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 mb-2 text-sm"/>
        <div className="flex gap-2">
          <button disabled={isPending} onClick={save} className="flex-1 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold disabled:opacity-50">{isPending?'يحفظ…':'حفظ'}</button>
          <button onClick={()=>setEditing(false)} className="flex-1 py-1.5 rounded-lg border border-zinc-700 text-xs">إلغاء</button>
        </div>
        {msg && <div className="text-xs mt-1.5 text-red-400">{msg}</div>}
      </li>
    )
  }

  return (
    <li className="flex justify-between items-center bg-black/30 px-3 py-2 rounded-lg border border-zinc-900">
      <span>#{lesson.order_index} {lesson.title}</span>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs">{lesson.video_url ? '🎥' : '📄'}</span>
        <button onClick={()=>setEditing(true)} className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 text-zinc-300 hover:border-cyan-500/40">تعديل</button>
        <button onClick={onDelete} className="text-[11px] px-2 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10">حذف</button>
      </div>
    </li>
  )
}
