import React from 'react'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tumaet/prompt-ui-components'

import { useForm } from 'react-hook-form'
import {
  CourseAppearanceFormValues,
  courseAppearanceFormSchema,
} from '@core/validations/courseAppearance'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSelector } from './components/IconSelector'
import DynamicIcon from '@/components/DynamicIcon'

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

  const selectedColor = form.watch('color')
  const selectedIcon = form.watch('icon')

  return (
    <Form {...form}>
      <h3 className='text-lg font-semibold mb-2'>Preview</h3>
      <div className='flex items-center space-x-4'>
        <div
          className={`
                relative flex aspect-square size-12 items-center justify-center
                after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary
              `}
        >
          <div
            className={`
                  flex aspect-square items-center justify-center rounded-lg text-gray-800
                  size-12 
                  ${selectedColor || 'bg-gray-100'}
                `}
          >
            <DynamicIcon name={selectedIcon || 'circle-help'} />
          </div>
        </div>
        <span className='text-sm text-gray-600'>
          This is how your course icon will appear in the sidebar. <br />
          <b>Please note:</b> it will only be displayed while the course is active.
        </span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a color' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subtleColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className='flex items-center'>
                        <div className={`w-4 h-4 rounded mr-2 ${color}`}></div>
                        {color.split('-')[1]}
                      </div>
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
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select an Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an icon' />
                  </SelectTrigger>
                </FormControl>
                <IconSelector />
              </Select>
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
