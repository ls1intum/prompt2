import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  DatePickerWithRange,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  useToast,
} from '@tumaet/prompt-ui-components'
import {
  CourseType,
  CourseTypeDetails,
  UpdateCourseData,
  useCourseStore,
} from '@tumaet/prompt-shared-state'
import { EditCourseFormValues, editCourseSchema } from '@core/validations/editCourse'
import { updateCourseData } from '@core/network/mutations/updateCourseData'

interface CourseEditDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const EditCourseDialog = ({ isOpen, onClose }: CourseEditDialogProps): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      dateRange: {
        from: course?.startDate ? new Date(course.startDate) : new Date(),
        to: course?.endDate ? new Date(course.endDate) : new Date(),
      },
      courseType: course?.courseType,
      ects: course?.ects ?? 0,
    },
  })

  const selectedCourseType = form.watch('courseType')
  const isEctsDisabled = CourseTypeDetails[selectedCourseType]?.ects !== undefined

  useEffect(() => {
    const ectsValue = CourseTypeDetails[selectedCourseType]?.ects
    if (ectsValue !== undefined) {
      form.setValue('ects', ectsValue as number, { shouldValidate: true })
    }
  }, [selectedCourseType, form])

  const { mutate: mutateCourse } = useMutation({
    mutationFn: (courseData: UpdateCourseData) => {
      return updateCourseData(courseId ?? 'undefined', courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Successfully Updated Course',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to Store Course Details',
        description: 'Please try again later!',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EditCourseFormValues) => {
    const updateData: UpdateCourseData = {
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
      courseType: data.courseType,
      ects: data.ects,
    }
    mutateCourse(updateData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} aria-hidden='true'>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit {course?.name}</DialogTitle>
          <DialogDescription>The course name and semester tag cannot be changed.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='dateRange'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Course Duration</FormLabel>
                  <DatePickerWithRange date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='courseType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a course type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CourseType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {CourseTypeDetails[type as CourseType].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ects'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ECTS</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter ECTS'
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                      value={field.value === 0 && !isEctsDisabled ? '' : field.value}
                      disabled={isEctsDisabled}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit'>Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
