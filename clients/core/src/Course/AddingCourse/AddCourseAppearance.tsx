import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import {
  CourseAppearanceFormValues,
  courseAppearanceFormSchema,
} from '../../validations/courseAppearance'
import { zodResolver } from '@hookform/resolvers/zod'

interface AddCourseAppearanceProps {
  onBack: () => void
  onSubmit: (data: CourseAppearanceFormValues) => void
}

export const AddCourseAppearance: React.FC<AddCourseAppearanceProps> = ({ onBack, onSubmit }) => {
  const form = useForm<CourseAppearanceFormValues>({
    resolver: zodResolver(courseAppearanceFormSchema),
    defaultValues: {
      color: '',
      icon: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input placeholder='Enter color (e.g., bg-red-100)' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input placeholder='Enter icon name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-between space-x-2'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit'>Add Course</Button>
        </div>
      </form>
    </Form>
  )
}
