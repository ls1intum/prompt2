import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormDescription, FormLabel } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'

interface CheckboxQuestionProps {
  form: UseFormReturn<{ answers: string[] }>
  question: ApplicationQuestionMultiSelect
}

export const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({ form, question }) => (
  <div className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
    <Checkbox
      checked={form.getValues().answers.length > 0}
      onCheckedChange={(checked) => {
        form.setValue('answers', checked ? ['Yes'] : [], { shouldValidate: true })
      }}
    />
    <div className='space-y-1 leading-none'>
      <FormLabel>
        {question.title}
        {question.is_required && <span className='text-destructive'> *</span>}
      </FormLabel>
      {question.description && <FormDescription>{question.description}</FormDescription>}
    </div>
  </div>
)
