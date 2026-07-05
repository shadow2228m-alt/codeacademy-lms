export const dynamic = 'force-dynamic'
import { listCoursesFull } from './actions'
import CourseManager from './CourseManager'

export default async function AdminCoursesPage(){
  const courses = await listCoursesFull()
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-fuchsia-300 neon-text">إدارة الكورسات والدروس</h1>
      <p className="text-zinc-400 mt-2">أنشئ كورس → أضف دروس → اربط Quiz</p>
      <div className="mt-8">
        <CourseManager initialCourses={courses as any} />
      </div>
    </div>
  )
}
