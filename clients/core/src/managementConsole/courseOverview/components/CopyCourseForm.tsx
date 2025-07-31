import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Input,
  Button,
  DatePickerWithRange,
} from '@tumaet/prompt-ui-components'
import type { UseFormReturn } from 'react-hook-form'
import type { CopyCourseFormValues } from '@core/validations/copyCourse'

interface CopyCourseFormProps {
  form: UseFormReturn<CopyCourseFormValues>
  courseName?: string
  onSubmit: (data: CopyCourseFormValues) => void
  onClose: () => void
  useTemplateCopy?: boolean
}

export const CopyCourseForm = ({
  form,
  courseName,
  onSubmit,
  onClose,
  useTemplateCopy,
}: CopyCourseFormProps): JSX.Element => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {useTemplateCopy ? `Create Course from Template: ${courseName}` : `Copy: ${courseName}`}
        </DialogTitle>
        <DialogDescription>
          {useTemplateCopy
            ? 'Create a new course based on this template.'
            : 'Create a complete copy of this course.'}
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
          {!useTemplateCopy && (
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
          )}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Continue</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
