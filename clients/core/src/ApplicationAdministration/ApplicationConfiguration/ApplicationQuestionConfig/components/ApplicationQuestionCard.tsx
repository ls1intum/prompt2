import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import {
  QuestionConfigFormData,
  QuestionConfigFormDataMultiSelect,
  QuestionConfigFormDataText,
  questionConfigSchema,
} from '../../../../validations/questionConfig'
import { MultiSelectConfig } from './MultiSelectConfig'
import { TextConfig } from './TextConfig'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { DeleteConfirmation } from './DeleteConfirmation'
import { questionsEqual } from '../handlers/computeQuestionsModified'
import { QuestionStatus, QuestionStatusBadge } from '../components/QuestionStatusBadge'
import { isCheckboxQuestion } from '../../../../Application/utils/CheckBoxRequirements'

// If you plan to expose methods via this ref, define them here:
export interface ApplicationQuestionCardRef {
  validate: () => Promise<boolean>
  getValues: () => QuestionConfigFormData
}

interface ApplicationQuestionCardProps {
  question: ApplicationQuestionMultiSelect | ApplicationQuestionText
  originalQuestion: ApplicationQuestionMultiSelect | ApplicationQuestionText | undefined
  index: number
  onUpdate: (updatedQuestion: ApplicationQuestionMultiSelect | ApplicationQuestionText) => void
  submitAttempted: boolean
  onDelete: (id: string) => void
}

export const ApplicationQuestionCard = forwardRef<
  ApplicationQuestionCardRef | undefined, // or null if you prefer
  ApplicationQuestionCardProps
>(function ApplicationQuestionCard(
  { question, index, originalQuestion, onUpdate, submitAttempted, onDelete },
  ref,
) {
  const isNewQuestion = question.title === '' ? true : false
  const [isExpanded, setIsExpanded] = useState(isNewQuestion)
  const isMultiSelect = 'options' in question
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const status: QuestionStatus = originalQuestion
    ? questionsEqual(question, originalQuestion)
      ? 'saved'
      : 'modified'
    : 'new'

  const form = useForm<QuestionConfigFormData>({
    resolver: zodResolver(questionConfigSchema),
    defaultValues: { type: isMultiSelect ? 'multi-select' : 'text', ...question },
    mode: 'onTouched',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      onUpdate({ ...question, ...value })
    })
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [form.watch, question, onUpdate, form])

  // allow to call validate from the parent component
  useImperativeHandle(ref, () => ({
    async validate() {
      const valid = await form.trigger()
      return valid
    },
    getValues() {
      return form.getValues()
    },
  }))

  useEffect(() => {
    console.log(form.formState.errors)
  }, [form.formState.errors])

  const checkBoxQuestion =
    isMultiSelect && isCheckboxQuestion(question as ApplicationQuestionMultiSelect)

  return (
    <>
      <Card
        className={`mb-4 ${submitAttempted && !form.formState.isValid ? 'border-red-500' : ''}`}
      >
        <CardHeader className='cursor-pointer' onClick={() => setIsExpanded(!isExpanded)}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <GripVertical className='cursor-move h-6 w-6 text-muted-foreground' />
              <div>
                <CardTitle>{question.title || `Untitled Question`}</CardTitle>
                <p className='text-sm text-muted-foreground mt-1'>
                  Question {index + 1}:{' '}
                  {isMultiSelect
                    ? checkBoxQuestion
                      ? 'Checkbox'
                      : 'Multi-select question'
                    : 'Text question'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <QuestionStatusBadge status={status} />
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  if (question.id.startsWith('no-valid-id')) {
                    onDelete(question.id)
                  } else {
                    setDeleteDialogOpen(true)
                  }
                }}
                aria-label='Delete question'
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
              {isExpanded ? <ChevronUp className='h-6 w-6' /> : <ChevronDown className='h-6 w-6' />}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            <Form {...form}>
              <form className='space-y-4'>
                <FormField
                  control={form.control}
                  name='is_required'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Question is required to be answered</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className='text-destructive'> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter question title' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter question description' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!checkBoxQuestion && (
                  <FormField
                    control={form.control}
                    name='placeholder'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Enter placeholder text' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name='error_message'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error Message</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter error message' />
                      </FormControl>
                      <FormDescription>
                        The custom error message that will be displayed if the question is not
                        answered or validation fails.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isMultiSelect ? (
                  !checkBoxQuestion && (
                    <MultiSelectConfig
                      form={form as UseFormReturn<QuestionConfigFormDataMultiSelect>}
                    />
                  )
                ) : (
                  <TextConfig form={form as UseFormReturn<QuestionConfigFormDataText>} />
                )}
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
      {deleteDialogOpen && (
        <DeleteConfirmation
          isOpen={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onClick={(deleteConfirmed) => (deleteConfirmed ? onDelete(question.id) : null)}
        />
      )}
    </>
  )
})
