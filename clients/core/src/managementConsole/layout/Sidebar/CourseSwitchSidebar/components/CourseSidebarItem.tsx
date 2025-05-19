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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DeleteConfirmation,
  useToast,
} from '@tumaet/prompt-ui-components'
import { useState } from 'react'
import type React from 'react'
import { Edit, Trash2, Copy } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditCourseDialog } from '@core/managementConsole/courseOverview/components/EditCourseDialog'
import { deleteCourse } from '@core/network/mutations/deleteCourse'

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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setIsContextMenuOpen(true)
  }

  const { mutate: mutateDeleteCourse } = useMutation({
    mutationFn: () => deleteCourse(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Course Deleted',
        description: `${course.name} has been successfully deleted.`,
      })
    },
    onError: () => {
      toast({
        title: 'Failed to Delete Course',
        description: 'Please try again later!',
        variant: 'destructive',
      })
    },
  })

  const handleDelete = (deleteConfirmed: boolean) => {
    if (deleteConfirmed) {
      mutateDeleteCourse()
    }
    setIsContextMenuOpen(false)
  }

  return (
    <>
      <SidebarMenuItem key={course.id} onContextMenu={handleContextMenu}>
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

      <DropdownMenu open={isContextMenuOpen} onOpenChange={setIsContextMenuOpen} modal={false}>
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
        <DropdownMenuContent align='start'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setIsContextMenuOpen(false)
              setShowEditDialog(true)
            }}
          >
            <Edit className='mr-2 h-4 w-4' />
            <span>Edit Course</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsContextMenuOpen(false)
              setShowCopyDialog(true)
            }}
          >
            <Copy className='mr-2 h-4 w-4' />
            <span>Copy Course</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive'
            onClick={() => {
              setIsContextMenuOpen(false)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Delete Course</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteDialogOpen && (
        <DeleteConfirmation
          isOpen={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          deleteMessage={`Are you sure you want to delete ${course.name}?`}
          customWarning={`This action cannot be undone. All student associations with this course will be lost. 
            If you want to keep the course data, consider archiving it instead.`}
          onClick={handleDelete}
        />
      )}

      {showEditDialog && (
        <EditCourseDialog isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} />
      )}

      {showCopyDialog && (
        <CopyCourseDialog
          courseId={course.id}
          isOpen={showCopyDialog}
          onClose={() => setShowCopyDialog(false)}
        />
      )}
    </>
  )
}
