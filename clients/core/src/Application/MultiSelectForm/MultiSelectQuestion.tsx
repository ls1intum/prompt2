import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormDescription, FormLabel } from '@/components/ui/form'
import { MultiSelect } from '@/components/MultiSelect'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
        {question.min_select > 0 && <span className='text-destructive'> *</span>}
      </FormLabel>
      {question.description && <FormDescription>{question.description}</FormDescription>}
      {question.max_select > 1 ? (
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
      ) : (
        <Select
          onValueChange={(value) => {
            form.setValue('answers', [value], { shouldValidate: true })
          }}
          defaultValue={initialAnswers.length === 1 ? initialAnswers[0] : ''}
        >
          <SelectTrigger>
            <SelectValue placeholder={question.placeholder || 'Please select...'} />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </>
  )
}
