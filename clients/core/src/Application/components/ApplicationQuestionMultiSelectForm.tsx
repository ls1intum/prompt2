import React, { forwardRef, useImperativeHandle } from 'react'
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
import { QuestionMultiSelectFormRef } from '../utils/QuestionMultiSelectFormRef'
import { MultiSelect } from '@/components/MultiSelect'
import { Checkbox } from '@/components/ui/checkbox'
import { checkCheckBoxQuestion } from '../utils/CheckBoxRequirements'

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
    // Create validation schema dynamically based on question properties
    const validationSchema = z.object({
      answers: z
        .array(z.string())
        .min(
          question.is_required ? question.min_select : 0,
          `Select at least ${question.min_select} option${question.min_select > 1 ? 's' : ''}.`,
        )
        .max(
          question.max_select,
          `Select no more than ${question.max_select} option${question.max_select > 1 ? 's' : ''}.`,
        ),
    })

    const form = useForm<{ answers: string[] }>({
      resolver: zodResolver(validationSchema),
      defaultValues: { answers: initialAnswers || [] },
      mode: 'onChange',
    })

    // Expose validation method
    useImperativeHandle(ref, () => ({
      async validate() {
        const isValid = await form.trigger()
        console.log('Validating question', question.title, ' isValid: ', isValid)
        return isValid
      },
      getValues() {
        return { applicationQuestionId: question.id, answer: form.getValues().answers }
      },
    }))

    const isCheckboxQuestion = checkCheckBoxQuestion(question)

    const multiSelectOptions = question.options.map((option) => ({
      label: option,
      value: option,
    }))

    return (
      <Form {...form}>
        <form>
          <FormItem>
            {!isCheckboxQuestion && (
              <>
                <FormLabel>
                  {question.title}
                  {question.is_required ? <span className='text-destructive'> *</span> : ''}
                </FormLabel>
                {question.description && <FormDescription>{question.description}</FormDescription>}
              </>
            )}
            <FormField
              control={form.control}
              name='answers'
              render={({ fieldState }) => (
                <>
                  <FormControl>
                    {isCheckboxQuestion ? (
                      <div className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                        <Checkbox
                          checked={form.getValues().answers.length > 0}
                          onCheckedChange={(checked) => {
                            form.setValue('answers', checked ? ['Yes'] : [], {
                              shouldValidate: true,
                            })
                          }}
                        />
                        <div className='space-y-1 leading-none'>
                          <FormLabel>
                            {question.title}
                            {question.is_required ? (
                              <span className='text-destructive'> *</span>
                            ) : (
                              ''
                            )}
                          </FormLabel>
                          {question.description && (
                            <FormDescription>{question.description}</FormDescription>
                          )}
                        </div>
                      </div>
                    ) : (
                      <MultiSelect
                        options={multiSelectOptions}
                        placeholder={
                          question.placeholder && question.placeholder !== ''
                            ? question.placeholder
                            : 'Please select...'
                        }
                        defaultValue={initialAnswers}
                        onValueChange={(values) => {
                          form.setValue('answers', values, { shouldValidate: true })
                        }}
                        maxCount={question.max_select}
                        variant='inverted'
                      />
                    )}
                  </FormControl>
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
