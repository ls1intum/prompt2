import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { courseFormSchema, CourseFormValues } from '../../validations/course'
import { DatePickerWithRange } from '@/components/DateRangePicker'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

interface AddCoursePropertiesProps {
  onNext: (data: CourseFormValues) => void
  onCancel: () => void
  initialValues?: Partial<CourseFormValues>
}

export const AddCourseProperties: React.FC<AddCoursePropertiesProps> = ({
  onNext,
  onCancel,
  initialValues,
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      dateRange: initialValues?.dateRange,
      course_type: initialValues?.course_type || '',
      ects: initialValues?.ects || 0,
      semester_tag: initialValues?.semester_tag || '',
    },
  })

  const onSubmit = (data: CourseFormValues) => {
    onNext(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter course name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='dateRange'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Course Duration</FormLabel>
              <DatePickerWithRange date={field.value} setDate={field.onChange} />
              <FormDescription>Select the start and end dates for your course.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='course_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Type</FormLabel>
              <FormControl>
                <Input placeholder='Enter course type' {...field} />
              </FormControl>
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
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='semester_tag'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester Tag</FormLabel>
              <FormControl>
                <Input placeholder='Enter semester tag' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-between space-x-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit'>Next</Button>
        </div>
      </form>
    </Form>
  )
}
