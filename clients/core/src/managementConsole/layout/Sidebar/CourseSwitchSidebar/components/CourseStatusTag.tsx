import { Course } from '@tumaet/prompt-shared-state'
import { PropsWithChildren } from 'react'
import { Archive, File } from 'lucide-react'

interface CourseStatusTagProps {
  course: Course
}

const CourseStatusTagLayout = ({ children }: PropsWithChildren) => {
  return <div className='flex items-center gap-1'>{children}</div>
}

export const CourseStatusTag = ({ course }: CourseStatusTagProps) => {
  return (
    <>
      {course.archived && (
        <CourseStatusTagLayout>
          <Archive className='w-4 h-4' />
          Archived
        </CourseStatusTagLayout>
      )}
      {course.template && (
        <CourseStatusTagLayout>
          <File className='w-4 h-4' />
          Template
        </CourseStatusTagLayout>
      )}
    </>
  )
}
