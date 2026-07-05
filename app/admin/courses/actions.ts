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

export async function updateCourse(courseId: string, form: {title?:string, slug?:string, description?:string, level?:string, is_published?:boolean}) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('courses').update(form).eq('id', courseId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  return { success:true }
}

export async function deleteCourse(courseId: string) {
  const { supabase } = await requireAdmin()
  // lessons are ON DELETE CASCADE in schema, so this also removes lessons
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
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

export async function updateLesson(lessonId: string, form: {title?:string, video_url?:string, content_md?:string, order_index?:number}) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('lessons').update(form).eq('id', lessonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  return { success:true }
}

export async function deleteLesson(lessonId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/courses')
  return { success:true }
}

export async function listCoursesFull(){
  const { supabase } = await requireAdmin()
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending:false })
  const { data: lessons } = await supabase.from('lessons').select('*').order('order_index')
  return (courses ?? []).map(c=>({
    ...c,
    lessons: (lessons ?? []).filter(l=>l.course_id === c.id)
  }))
}
