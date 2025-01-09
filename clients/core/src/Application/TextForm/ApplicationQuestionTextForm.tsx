import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuestionTextFormRef } from '../utils/QuestionTextFormRef'
import { createValidationSchema } from './validationSchema'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { FormDescriptionHTML } from '../components/FormDescriptionHTML'

interface ApplicationQuestionTextFormProps {
  question: ApplicationQuestionText
  initialAnswer?: string
  disabled?: boolean
}

export const ApplicationQuestionTextForm = forwardRef(function ApplicationQuestionTextForm(
  { question, initialAnswer, disabled = false }: ApplicationQuestionTextFormProps,
  ref: React.Ref<QuestionTextFormRef>,
) {
  const [charCount, setCharCount] = useState(initialAnswer?.length || 0)

  // Create validation schema dynamically based on question properties
  const validationSchema = createValidationSchema(question)

  const form = useForm<{ answer: string }>({
    resolver: zodResolver(validationSchema),
    defaultValues: { answer: initialAnswer ?? '' },
    mode: 'onChange',
  })

  // Expose validation method
  useImperativeHandle(ref, () => ({
    async validate() {
      const isValid = await form.trigger()
      return isValid
    },
    getValues() {
      return { application_question_id: question.id, answer: form.getValues().answer }
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
          <FormControl>
            <FormField
              control={form.control}
              name='answer'
              render={({ field, fieldState }) => (
                <>
                  <FormLabel>
                    {question.title}
                    {question.is_required ? <span className='text-destructive'> *</span> : ''}
                  </FormLabel>
                  {question.description && <FormDescriptionHTML htmlCode={question.description} />}
                  <div className='relative'>
                    {isTextArea ? (
                      <Textarea
                        {...field}
                        placeholder={question.placeholder || ''}
                        maxLength={question.allowed_length}
                        className='pr-12'
                        rows={4}
                        disabled={disabled}
                      />
                    ) : (
                      <Input
                        {...field}
                        placeholder={question.placeholder || ''}
                        maxLength={question.allowed_length}
                        className='pr-12'
                        disabled={disabled}
                      />
                    )}
                    <div className='absolute right-2 bottom-2 text-sm text-gray-500'>
                      {charCount}/{question.allowed_length || 255}
                    </div>
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </>
              )}
            />
          </FormControl>
        </FormItem>
      </form>
    </Form>
  )
})
