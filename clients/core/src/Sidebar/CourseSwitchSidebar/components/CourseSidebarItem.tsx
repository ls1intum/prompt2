import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Course } from '@/interfaces/course'
import DynamicIcon from '@/components/DynamicIcon'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Todo move somewhere else
const subtleColors = [
  'bg-red-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-indigo-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-orange-100',
  'bg-teal-100',
  'bg-cyan-100',
]

interface CourseSidebarItemProps {
  course: Course
}

export const CourseSidebarItem = ({ course }: CourseSidebarItemProps): JSX.Element => {
  const { setOpen } = useSidebar()
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()

  const isActive = course.id === courseId
  const bgColor = course.meta_data?.['bg-color'] || subtleColors['bg-grey-100']
  const iconName = course.meta_data?.['icon'] || 'graduation-cap'

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
          children: course.name,
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
            isActive
              ? 'after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary'
              : ''
          }`}
        >
          <div
            className={`
                flex aspect-square items-center justify-center rounded-lg  text-gray-800
                ${isActive ? 'size-12' : 'size-10'} 
                ${bgColor}
            `}
          >
            <div className='size-6'>{MemoizedIcon}</div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
