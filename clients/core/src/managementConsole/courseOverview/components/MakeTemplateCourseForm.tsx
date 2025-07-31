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
  Input,
  Button,
} from '@tumaet/prompt-ui-components'
import type { UseFormReturn } from 'react-hook-form'
import type { MakeTemplateCourseFormValues } from '@core/validations/makeTemplateCourse'

interface MakeTemplateCourseFormProps {
  form: UseFormReturn<MakeTemplateCourseFormValues>
  courseName?: string
  onSubmit: (data: MakeTemplateCourseFormValues) => void
  onClose: () => void
  useTemplateCopy?: boolean
}

export const MakeTemplateCourseForm = ({
  form,
  courseName,
  onSubmit,
  onClose,
  useTemplateCopy,
}: MakeTemplateCourseFormProps): JSX.Element => {
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
