import type React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { DatePickerWithRange } from '@/components/DateRangePicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CourseType, CourseTypeDetails, useCourseStore } from '@tumaet/prompt-shared-state'
import { z } from 'zod'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'

// Define the schema for the edit form
const editCourseSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  courseType: z.string().min(1, 'Course type is required'),
  ects: z.number().min(0, 'ECTS must be a positive number'),
})

type EditCourseFormValues = z.infer<typeof editCourseSchema>

interface CourseEditDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const EditCourseDialog = ({ isOpen, onClose }: CourseEditDialogProps): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)

  const form = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      dateRange: {
        from: course?.startDate ? new Date(course.startDate) : new Date(),
        to: course?.endDate ? new Date(course.endDate) : new Date(),
      },
      courseType: (course?.courseType as CourseType) ?? CourseType.LECTURE,
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

  const onSubmit = (data: EditCourseFormValues) => {
    console.log(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <div className='p-2 bg-muted rounded-md'>{course?.name}</div>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Semester Tag</FormLabel>
              <FormControl>
                <div className='p-2 bg-muted rounded-md'>{course?.semesterTag}</div>
              </FormControl>
            </FormItem>
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
