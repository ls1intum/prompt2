import React, { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { QuestionMultiSelectFormRef } from '../utils/QuestionMultiSelectFormRef'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { createValidationSchema } from './validationSchema'
import { CheckboxQuestion } from './CheckboxQuestion'
import { MultiSelectQuestion } from './MultiSelectQuestion'
import { checkCheckBoxQuestion } from '../utils/CheckBoxRequirements'

interface ApplicationQuestionMultiSelectFormProps {
  question: ApplicationQuestionMultiSelect
  initialAnswers?: string[]
}

export const ApplicationQuestionMultiSelectForm = forwardRef(
  function ApplicationQuestionMultiSelectForm(
    { question, initialAnswers = [] }: ApplicationQuestionMultiSelectFormProps,
    ref: React.Ref<QuestionMultiSelectFormRef>,
  ) {
    const isCheckboxQuestion = checkCheckBoxQuestion(question)

    const validationSchema = createValidationSchema(question, isCheckboxQuestion)

    const form = useForm<{ answers: string[] }>({
      resolver: zodResolver(validationSchema),
      defaultValues: { answers: initialAnswers },
      mode: 'onChange',
    })

    useImperativeHandle(ref, () => ({
      async validate() {
        const isValid = await form.trigger()
        return isValid
      },
      getValues() {
        return { application_question_id: question.id, answer: form.getValues().answers }
      },
    }))

    return (
      <Form {...form}>
        <form>
          <FormItem>
            <FormControl>
              <FormField
                control={form.control}
                name='answers'
                render={({ fieldState }) => (
                  <>
                    {isCheckboxQuestion ? (
                      <CheckboxQuestion form={form} question={question} />
                    ) : (
                      <MultiSelectQuestion
                        form={form}
                        question={question}
                        initialAnswers={initialAnswers}
                      />
                    )}
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </>
                )}
              />
            </FormControl>
          </FormItem>
        </form>
      </Form>
    )
  },
)
