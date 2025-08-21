import type React from 'react'
import { useEffect } from 'react'
import {
  Button,
  Input,
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
import { templateFormSchema, type TemplateFormValues } from '@core/validations/template'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CourseType, CourseTypeDetails } from '@tumaet/prompt-shared-state'

interface AddTemplatePropertiesProps {
  onNext: (data: TemplateFormValues) => void
  onCancel: () => void
  initialValues?: Partial<TemplateFormValues>
}

export const AddTemplateProperties: React.FC<AddTemplatePropertiesProps> = ({
  onNext,
  onCancel,
  initialValues,
}) => {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      courseType: initialValues?.courseType || '',
      ects: initialValues?.ects ?? undefined,
      semesterTag: 'template',
    },
  })

  const onSubmit = (data: TemplateFormValues) => {
    onNext(data)
  }

  const selectedCourseType = form.watch('courseType')
  const isEctsDisabled = CourseTypeDetails[selectedCourseType]?.ects !== undefined

  useEffect(() => {
    const ectsValue = CourseTypeDetails[selectedCourseType]?.ects
    if (ectsValue !== undefined) {
      form.setValue('ects', ectsValue as number, { shouldValidate: true })
    }
  }, [selectedCourseType, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter a template name' {...field} className='w-full' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    value={field.value ?? ''}
                    disabled={isEctsDisabled}
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex justify-between space-x-4 pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit'>Next</Button>
        </div>
      </form>
    </Form>
  )
}
