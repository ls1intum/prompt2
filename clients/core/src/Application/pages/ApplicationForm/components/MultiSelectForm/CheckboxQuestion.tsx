import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormLabel } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { ApplicationQuestionMultiSelect } from '../../../../../interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { FormDescriptionHTML } from '../FormDescriptionHTML'

interface CheckboxQuestionProps {
  form: UseFormReturn<{ answers: string[] }>
  question: ApplicationQuestionMultiSelect
  isInstructorView?: boolean
}

export const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  form,
  question,
  isInstructorView = false,
}) => (
  <div className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
    <Checkbox
      checked={form.getValues().answers.length > 0}
      onCheckedChange={(checked) => {
        form.setValue('answers', checked ? ['Yes'] : [], { shouldValidate: true })
      }}
      disabled={isInstructorView}
    />
    <div className='space-y-1 leading-none'>
      <FormLabel>
        {question.title}
        {question.isRequired && <span className='text-destructive'> *</span>}
      </FormLabel>
      {!isInstructorView && question.description && (
        <FormDescriptionHTML htmlCode={question.description} />
      )}
    </div>
  </div>
)
