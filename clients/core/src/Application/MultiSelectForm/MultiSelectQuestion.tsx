import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormLabel } from '@/components/ui/form'
import { MultiSelect } from '@/components/MultiSelect'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDescriptionHTML } from '../components/FormDescriptionHTML'

interface MultiSelectQuestionProps {
  form: UseFormReturn<{ answers: string[] }>
  question: ApplicationQuestionMultiSelect
  initialAnswers: string[]
  disabled?: boolean
}

export const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  form,
  question,
  initialAnswers,
  disabled = false,
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
      {question.description && <FormDescriptionHTML htmlCode={question.description} />}
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
          disabled={disabled}
        />
      ) : (
        <Select
          onValueChange={(value) => {
            form.setValue('answers', [value], { shouldValidate: true })
          }}
          defaultValue={initialAnswers.length === 1 ? initialAnswers[0] : ''}
          disabled={disabled}
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
