import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { QuestionMultiSelectFormRef } from '../utils/QuestionMultiSelectFormRef'

export interface ApplicationQuestionMultiSelect {
  id: string
  course_phase_id: string
  title: string
  description?: string
  placeholder?: string
  error_message?: string
  is_required: boolean
  min_select: number
  max_select: number
  options: string[]
  order_num: number
}

export interface CreateApplicationAnswerMultiSelect {
  applicationQuestionId: string
  answers: string[]
}

interface ApplicationQuestionMultiSelectFormProps {
  question: ApplicationQuestionMultiSelect
  initialAnswers?: string[]
}

export const ApplicationQuestionMultiSelectForm = forwardRef(
  function ApplicationQuestionMultiSelectForm(
    { question, initialAnswers }: ApplicationQuestionMultiSelectFormProps,
    ref: React.Ref<QuestionMultiSelectFormRef>,
  ) {
    const [selectedCount, setSelectedCount] = useState(initialAnswers?.length || 0)

    // Create validation schema dynamically based on question properties
    const validationSchema = z.object({
      answers: z
        .array(z.string())
        .min(
          question.is_required ? question.min_select : 0,
          question.error_message || `Select at least ${question.min_select} options.`,
        )
        .max(
          question.max_select,
          question.error_message || `Select no more than ${question.max_select} options.`,
        ),
    })

    const form = useForm<{ answers: string[] }>({
      resolver: zodResolver(validationSchema),
      defaultValues: { answers: initialAnswers || [] },
      mode: 'onTouched',
    })

    // Expose validation method
    useImperativeHandle(ref, () => ({
      async validate() {
        console.log('Validating question', question.title)
        const isValid = await form.trigger()
        return isValid
      },
      getValues() {
        return { applicationQuestionId: question.id, answer: form.getValues().answers }
      },
    }))

    // Watch for changes in the "answers" field to update selected count
    useEffect(() => {
      const subscription = form.watch((value) => {
        setSelectedCount(value.answers?.length || 0)
      })
      return () => subscription.unsubscribe()
    }, [form, form.watch])

    return (
      <Form {...form}>
        <form>
          <FormItem>
            <FormLabel>{question.title}</FormLabel>
            {question.description && <FormDescription>{question.description}</FormDescription>}
            <FormField
              control={form.control}
              name='answers'
              render={({ field, fieldState }) => (
                <>
                  <FormControl>
                    <div className='space-y-2'>
                      {question.options.map((option, index) => (
                        <div key={index} className='flex items-center space-x-2'>
                          <Checkbox
                            value={option}
                            onChange={(e) => {
                              const checked = e.target
                              const currentValues = form.getValues().answers
                              const newValues = checked
                                ? [...currentValues, option]
                                : currentValues.filter((val) => val !== option)
                              field.onChange(newValues)
                            }}
                            checked={field.value.includes(option)}
                          />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <div className='text-sm text-gray-500'>
                    {selectedCount}/{question.max_select} selected
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </>
              )}
            />
          </FormItem>
        </form>
      </Form>
    )
  },
)
