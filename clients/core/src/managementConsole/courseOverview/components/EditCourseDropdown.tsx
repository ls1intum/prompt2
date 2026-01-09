import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DeleteConfirmation,
  useToast,
} from '@tumaet/prompt-ui-components'
import { Edit, MoreHorizontal, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'
import { deleteCourse } from '@core/network/mutations/deleteCourse'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EditCourseDialog } from './EditCourseDialog'
import { CopyCourseDialog } from './CopyCourseDialog'

export const EditCourseDropdown = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false)
  const [copyCourseDialogOpen, setCopyCourseDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: mutateDeleteCourse } = useMutation({
    mutationFn: () => deleteCourse(courseId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      navigate('/management/courses')
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
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-6 w-6' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditCourseDialogOpen(true)}>
            <Edit className='mr-2 h-4 w-4' />
            <span>Edit Course</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCopyCourseDialogOpen(true)}>
            <Copy className='mr-2 h-4 w-4' />
            <span>Copy Course</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='text-destructive' onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className='mr-2 h-4 w-4' />
            <span>Delete Course</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteDialogOpen && (
        <DeleteConfirmation
          isOpen={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          deleteMessage='Are you sure you want to delete this course?'
          customWarning={`This action cannot be undone. All student associations with this course will be lost. 
            If you want to keep the course data, consider archiving it instead.`}
          onClick={handleDelete}
        />
      )}

      {editCourseDialogOpen && (
        <EditCourseDialog
          isOpen={editCourseDialogOpen}
          onClose={() => setEditCourseDialogOpen(false)}
        />
      )}

      {copyCourseDialogOpen && (
        <CopyCourseDialog
          courseId={courseId ?? ''}
          isOpen={copyCourseDialogOpen}
          onClose={() => setCopyCourseDialogOpen(false)}
          useTemplateCopy={false}
          createTemplate={false}
        />
      )}
    </>
  )
}
