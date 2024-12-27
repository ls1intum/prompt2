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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuestionTextFormRef } from '../utils/QuestionTextFormRef'

export interface ApplicationQuestionText {
  id: string
  course_phase_id: string
  title: string
  description?: string
  placeholder?: string
  validation_regex?: string
  error_message?: string
  is_required: boolean
  allowed_length?: number
  order_num: number
}

export interface CreateApplicationAnswerText {
  applicationQuestionId: string
  answer: string
}

interface ApplicationQuestionTextFormProps {
  question: ApplicationQuestionText
  initialAnswer?: string
}

export const ApplicationQuestionTextForm = forwardRef(function ApplicationQuestionTextForm(
  { question, initialAnswer }: ApplicationQuestionTextFormProps,
  ref: React.Ref<QuestionTextFormRef>,
) {
  const [charCount, setCharCount] = useState(0)

  // Create validation schema dynamically based on question properties
  const validationSchema = z.object({
    answer: z
      .string()
      .min(question.is_required ? 1 : 0, 'This field is required')
      .max(
        question.allowed_length || 255,
        `Answer must be less than ${question.allowed_length} characters`,
      )
      .regex(
        new RegExp(question.validation_regex || '.*'),
        question.error_message || 'Invalid format',
      ),
  })

  const form = useForm<{ answer: string }>({
    resolver: zodResolver(validationSchema),
    defaultValues: { answer: initialAnswer ?? '' },
    mode: 'onChange',
  })

  // Expose validation method
  useImperativeHandle(ref, () => ({
    async validate() {
      console.log('Validating question', question.title)
      const isValid = await form.trigger()
      return isValid
    },
    getValues() {
      return { applicationQuestionId: question.id, answer: form.getValues().answer }
    },
  }))

  // Watch for changes in the "answer" field to update character count
  useEffect(() => {
    const subscription = form.watch((value) => {
      setCharCount(value.answer?.length || 0)
    })
    return () => subscription.unsubscribe()
  }, [form, form.watch])

  const isTextArea = (question.allowed_length || 255) > 100

  return (
    <Form {...form}>
      <form>
        <FormItem>
          <FormLabel>{question.title}</FormLabel>
          {question.description && <FormDescription>{question.description}</FormDescription>}
          <FormField
            control={form.control}
            name='answer'
            render={({ field, fieldState }) => (
              <>
                <FormControl>
                  <div className='relative'>
                    {isTextArea ? (
                      <Textarea
                        {...field}
                        placeholder={question.placeholder || ''}
                        maxLength={question.allowed_length}
                        className='pr-12'
                        rows={4}
                      />
                    ) : (
                      <Input
                        {...field}
                        placeholder={question.placeholder || ''}
                        maxLength={question.allowed_length}
                        className='pr-12'
                      />
                    )}
                    <div className='absolute right-2 bottom-2 text-sm text-gray-500'>
                      {charCount}/{question.allowed_length || 255}
                    </div>
                  </div>
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </>
            )}
          />
        </FormItem>
      </form>
    </Form>
  )
})
