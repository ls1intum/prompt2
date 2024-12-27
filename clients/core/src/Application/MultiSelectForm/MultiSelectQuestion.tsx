import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormDescription, FormLabel } from '@/components/ui/form'
import { MultiSelect } from '@/components/MultiSelect'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'

interface MultiSelectQuestionProps {
  form: UseFormReturn<{ answers: string[] }>
  question: ApplicationQuestionMultiSelect
  initialAnswers: string[]
}

export const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  form,
  question,
  initialAnswers,
}) => {
  const multiSelectOptions = question.options.map((option) => ({
    label: option,
    value: option,
  }))

  return (
    <>
      <FormLabel>
        {question.title}
        {question.is_required && <span className='text-destructive'> *</span>}
      </FormLabel>
      {question.description && <FormDescription>{question.description}</FormDescription>}
      <MultiSelect
        options={multiSelectOptions}
        placeholder={question.placeholder || 'Please select...'}
        defaultValue={initialAnswers}
        onValueChange={(values) => {
          form.setValue('answers', values, { shouldValidate: true })
        }}
        maxCount={question.max_select}
        variant='inverted'
      />
    </>
  )
}
