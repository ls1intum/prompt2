import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@tumaet/prompt-ui-components'
import type { Course } from '@tumaet/prompt-shared-state'
import DynamicIcon from '@/components/DynamicIcon'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { checkCourseTemplateStatus } from '../../../../../network/queries/checkCourseTemplateStatus'

interface CourseSidebarItemProps {
  course: Course
}

export const CourseSidebarItem = ({ course }: CourseSidebarItemProps): JSX.Element => {
  const { setOpen } = useSidebar()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()

  const isActive = course.id === courseId
  const bgColor = course.studentReadableData?.['bg-color'] || 'bg-gray-100'
  const iconName = course.studentReadableData?.['icon'] || 'graduation-cap'

  const { data } = useQuery({
    queryKey: ['template-status', course.id],
    queryFn: () => checkCourseTemplateStatus(course.id),
  })
  const isTemplate = data?.isTemplate || false

  const MemoizedIcon = useMemo(() => {
    return (
      <div className='size-6'>
        <DynamicIcon name={iconName} />
      </div>
    )
  }, [iconName])

  return (
    <SidebarMenuItem key={course.id}>
      <SidebarMenuButton
        size='lg'
        tooltip={{
          children: `${course.name} (${course.semesterTag})`,
          hidden: false,
        }}
        onClick={() => {
          setOpen(true)
          navigate(`/management/course/${course.id}`)
        }}
        isActive={isActive}
        className='min-w-12 min-h-12 p-0'
      >
        <div
          className={`relative flex aspect-square size-12 items-center justify-center ${
            isActive && isTemplate
              ? 'after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-dashed after:border-primary'
              : isActive && !isTemplate
                ? 'after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary'
                : ''
          }`}
        >
          <div
            className={`
            relative flex aspect-square items-center justify-center rounded-lg text-gray-800
            ${isActive ? 'size-12' : 'size-10'} ${bgColor}
            ${!isActive && isTemplate ? 'border-2 border-dashed border-primary' : ''}
          `}
          >
            <div className='size-6'>{MemoizedIcon}</div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
