import { Course } from '@/interfaces/course'
import { useCourseStore } from '@/zustand/useCourseStore'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const CourseOverview = (): JSX.Element => {
  const { courses } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const [course, setCourse] = useState<Course | undefined>(undefined)

  useEffect(() => {
    if (courseId) {
      const foundCourse = courses.find((c) => c.id === courseId)
      setCourse(foundCourse)
    }
  }, [courseId, courses])

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div>
      <h1>{course.name}</h1>
      <p>{course.semester_tag}</p>
      {/* Weitere Kursdetails */}
    </div>
  )
}
