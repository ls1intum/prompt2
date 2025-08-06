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
} from '@tumaet/prompt-ui-components'
import type { UseFormReturn } from 'react-hook-form'
import type { MakeTemplateCourseFormValues } from '@core/validations/makeTemplateCourse'

interface MakeTemplateCourseFormProps {
  form: UseFormReturn<MakeTemplateCourseFormValues>
  courseName: string
  onSubmit: (data: MakeTemplateCourseFormValues) => void
  onClose: () => void
}

export const MakeTemplateCourseForm = ({
  form,
  courseName,
  onSubmit,
  onClose,
}: MakeTemplateCourseFormProps): JSX.Element => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{`Create Template from Course: ${courseName}`}</DialogTitle>
        <DialogDescription>{'Create a new template based on this course.'}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter template name' {...field} className='w-full' />
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
                <FormLabel>Template Tag</FormLabel>
                <FormControl>
                  <Input placeholder='Enter template tag' {...field} className='w-full' />
                </FormControl>
                <FormDescription>
                  e.g. templateios (lowercase letters and numbers only)
                </FormDescription>
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
