import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
  DatePickerWithRange,
  FormDescription,
} from '@tumaet/prompt-ui-components'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { type CopyCourseFormValues, copyCourseSchema } from '@core/validations/copyCourse'
import { copyCourse } from '@core/network/mutations/copyCourse'
import { useNavigate } from 'react-router-dom'
import type { CopyCourse } from '../interfaces/copyCourse'

interface CourseCopyDialogProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
}

export const CopyCourseDialog = ({
  courseId,
  isOpen,
  onClose,
}: CourseCopyDialogProps): JSX.Element => {
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<CopyCourseFormValues>({
    resolver: zodResolver(copyCourseSchema),
    defaultValues: {
      name: course?.name,
      semesterTag: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  })

  const { mutate: mutateCopyCourse } = useMutation({
    mutationFn: (courseData: CopyCourse) => {
      return copyCourse(courseId ?? '', courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Successfully Copied Course',
      })
      navigate('/management/general')
    },
    onError: () => {
      toast({
        title: 'Failed to Copy Course',
        description: 'Please try again later!',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CopyCourseFormValues) => {
    const copyData: CopyCourse = {
      name: data.name,
      semesterTag: data.semesterTag,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
    }
    mutateCopyCourse(copyData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()} aria-hidden='true'>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Copy {course?.name}</DialogTitle>
          <DialogDescription>
            Create a copy of this course with a new name and semester tag.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter course name' {...field} className='w-full' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='semesterTag'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester Tag</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter semester tag' {...field} className='w-full' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dateRange'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration</FormLabel>
                  <DatePickerWithRange
                    date={field.value}
                    setDate={field.onChange}
                    className='w-full'
                  />
                  <FormDescription>Select the start and end dates for your course.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit'>Copy Course</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
