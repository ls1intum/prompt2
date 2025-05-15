import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '@tumaet/prompt-ui-components'
import { Course } from '@tumaet/prompt-shared-state'
import DynamicIcon from '@/components/DynamicIcon'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CopyCourseDialog } from '@core/managementConsole/courseOverview/components/CopyCourseDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { useState } from 'react'

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

  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

  const isActive = course.id === courseId
  const bgColor = course.studentReadableData?.['bg-color'] || subtleColors['bg-grey-100']
  const iconName = course.studentReadableData?.['icon'] || 'graduation-cap'

  const MemoizedIcon = useMemo(() => {
    return (
      <div className='size-6'>
        <DynamicIcon name={iconName} />
      </div>
    )
  }, [iconName])

  const handleItemClick = () => {
    navigate(`/courses/${course.id}`)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setIsContextMenuOpen(true)
  }

  const handleCopyCourse = () => {
    setIsContextMenuOpen(false)
    setShowCopyDialog(true)
  }

  return (
    <>
      <SidebarMenuItem key={course.id} onClick={handleItemClick} onContextMenu={handleContextMenu}>
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

      <DropdownMenu open={isContextMenuOpen} onOpenChange={setIsContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              transform: `translate(${contextMenuPosition.x}px, ${contextMenuPosition.y}px)`,
              opacity: 0,
              pointerEvents: isContextMenuOpen ? 'auto' : 'none',
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleCopyCourse}>Copy Course</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/courses/${course.id}/edit`)}>
            Edit Course
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate(`/courses/${course.id}/settings`)}
            className='text-destructive'
          >
            Delete Course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showCopyDialog && (
        <CopyCourseDialog isOpen={showCopyDialog} onClose={() => setShowCopyDialog(false)} />
      )}
    </>
  )
}
