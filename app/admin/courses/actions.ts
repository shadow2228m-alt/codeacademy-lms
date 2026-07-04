'use server'
import { requireAdmin, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


export async function createCourse(form: {title:string, slug:string, description:string, level:string}) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('courses').insert(form)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  return { success:true }
}

export async function createLesson(form: {course_id:string, title:string, video_url?:string, content_md?:string, order_index:number}) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('lessons').insert(form)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  return { success:true }
}

export async function listCoursesFull(){
  const supabase = createClient()
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending:false })
  const { data: lessons } = await supabase.from('lessons').select('*').order('order_index')
  return (courses ?? []).map(c=>({
    ...c,
    lessons: (lessons ?? []).filter(l=>l.course_id === c.id)
  }))
}
