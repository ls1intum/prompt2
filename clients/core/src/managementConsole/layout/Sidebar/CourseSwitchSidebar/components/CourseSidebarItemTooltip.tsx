import type { Course } from '@tumaet/prompt-shared-state'
import { CourseStatusTag } from './CourseStatusTag'

interface CourseSidebarItemTooltipProps {
  course: Course
}

export const CourseSidebarItemTooltip = ({
  course,
}: CourseSidebarItemTooltipProps) => {
  return (
    <div className='flex items-center gap-3'>
      <p>
        <strong className='font-semibold'>{course.name}</strong> ({course.semesterTag})
      </p>
      <CourseStatusTag course={course} />
    </div>
  )
}
