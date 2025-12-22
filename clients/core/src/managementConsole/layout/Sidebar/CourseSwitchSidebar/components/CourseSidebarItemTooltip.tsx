import { PropsWithChildren } from 'react'
import type { Course } from '@tumaet/prompt-shared-state'
import { Archive, File } from 'lucide-react'

interface CourseSidebarItemTooltipProps {
  course: Course
}

const CourseSidebarItemStatusTag = ({ children }: PropsWithChildren): JSX.Element => {
  return <div className='flex items-center gap-1 bg-gray-100 rounded-2xl px-2'>{children}</div>
}

export const CourseSidebarItemTooltip = ({
  course,
}: CourseSidebarItemTooltipProps): JSX.Element => {
  return (
    <div className='flex gap-1 items-center'>
      <p>
        {course.name} ({course.semesterTag})
      </p>
      {course.archived && (
        <CourseSidebarItemStatusTag>
          <Archive className='w-4 h-4' />
          Archived
        </CourseSidebarItemStatusTag>
      )}
      {course.template && (
        <CourseSidebarItemStatusTag>
          <File className='w-4 h-4' />
          Template
        </CourseSidebarItemStatusTag>
      )}
    </div>
  )
}
