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
import { UseFormReturn } from 'react-hook-form'
import { CourseFormValues } from '../../validations/course'
import { DatePickerWithRange } from '@/components/DateRangePicker'

interface AddCoursePropertiesProps {
  form: UseFormReturn<CourseFormValues>
  onNext: () => void
  onCancel: () => void
}

export const AddCourseProperties: React.FC<AddCoursePropertiesProps> = ({
  form,
  onNext,
  onCancel,
}) => {
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
        className='space-y-4'
      >
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
