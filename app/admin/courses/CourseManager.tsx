'use client'
import { useState, useTransition } from 'react'
import { createCourse, createLesson } from './actions'

export default function CourseManager({ initialCourses }:{ initialCourses:any[] }){
  const [courses, setCourses] = useState(initialCourses)
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [desc,setDesc]=useState('')
  const [level,setLevel]=useState('beginner')
  const [isPending, startTransition]=useTransition()

  const addCourse = ()=>{
    startTransition(async()=>{
      await createCourse({ title, slug, description: desc, level })
      location.reload()
    })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6" dir="rtl">
      <div className="rounded-2xl border border-fuchsia-500/20 bg-zinc-950/70 p-5">
        <div className="font-bold text-fuchsia-300 mb-3">كورس جديد</div>
        <input placeholder="Title" value={title} onChange={e=>{setTitle(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g,'-'))}} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <input placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <textarea placeholder="description" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-2"/>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-xl px-3 py-2 mb-3">
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="advanced">advanced</option>
        </select>
        <button disabled={isPending||!title||!slug} onClick={addCourse} className="w-full py-2.5 rounded-xl bg-fuchsia-500 text-black font-bold disabled:opacity-50">إنشاء</button>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {courses.map((c:any)=>(
          <CourseCard key={c.id} course={c} />
        ))}
        {courses.length===0 && <div className="text-zinc-500">لا كورسات بعد</div>}
      </div>
    </div>
  )
}

function CourseCard({ course }:{course:any}){
  const [open,setOpen]=useState(false)
  const [ltitle,setLtitle]=useState('')
  const [lvideo,setLvideo]=useState('')
  const [lcontent,setLcontent]=useState('')
  const [isPending,startTransition]=useTransition()

  const addLesson=()=>{
    startTransition(async()=>{
      await createLesson({
        course_id: course.id,
        title: ltitle,
        video_url: lvideo || undefined,
        content_md: lcontent || undefined,
        order_index: (course.lessons?.length || 0)
      })
      location.reload()
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg text-cyan-200">{course.title}</div>
          <div className="text-xs text-zinc-400 mt-1">{course.slug} • {course.level}</div>
          <div className="text-sm text-zinc-300 mt-2">{course.description}</div>
        </div>
        <button onClick={()=>setOpen(!open)} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700">{open?'إغلاق':'إدارة الدروس'}</button>
      </div>
      <div className="text-xs text-zinc-500 mt-3">{course.lessons?.length || 0} درس</div>
      {open && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            <input placeholder="عنوان الدرس" value={ltitle} onChange={e=>setLtitle(e.target.value)} className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
            <input placeholder="video_url" value={lvideo} onChange={e=>setLvideo(e.target.value)} className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
            <textarea placeholder="content_md" value={lcontent} onChange={e=>setLcontent(e.target.value)} className="md:col-span-2 bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button disabled={isPending||!ltitle} onClick={addLesson} className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-sm">+ إضافة درس</button>

          <ul className="mt-4 space-y-2 text-sm">
            {(course.lessons||[]).map((l:any)=>(
              <li key={l.id} className="flex justify-between bg-black/30 px-3 py-2 rounded-lg border border-zinc-900">
                <span>#{l.order_index} {l.title}</span>
                <span className="text-zinc-500 text-xs">{l.video_url ? '🎥' : '📄'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
