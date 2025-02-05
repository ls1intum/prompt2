import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DeleteConfirmation } from '@/components/DeleteConfirmationDialog'
import { deleteCourse } from '@core/network/mutations/deleteCourse'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export const EditCourseDropdown = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: mutateDeleteCourse } = useMutation({
    mutationFn: () => deleteCourse(courseId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      navigate('/management/general')
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-6 w-6' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>
            <Edit className='mr-2 h-4 w-4' />
            <span>Edit Course</span>
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
    </>
  )
}
