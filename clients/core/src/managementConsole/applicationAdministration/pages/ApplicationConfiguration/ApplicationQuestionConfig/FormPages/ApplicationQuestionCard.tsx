import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Button,
  TooltipProvider,
  Switch,
  Separator,
} from '@tumaet/prompt-ui-components'
import { ApplicationQuestionMultiSelect } from '@core/interfaces/application/applicationQuestion/applicationQuestionMultiSelect'
import { ApplicationQuestionText } from '@core/interfaces/application/applicationQuestion/applicationQuestionText'
import {
  QuestionConfigFormData,
  QuestionConfigFormDataMultiSelect,
  QuestionConfigFormDataText,
  questionConfigSchema,
} from '@core/validations/questionConfig'
import { MultiSelectConfig } from './MultiSelectConfig'
import { TextConfig } from './TextConfig'
import { DeleteConfirmation } from '../components/DeleteConfirmation'
import { questionsEqual } from '../handlers/computeQuestionsModified'
import { QuestionStatus, QuestionStatusBadge } from '../components/QuestionStatusBadge'
import { checkCheckBoxQuestion } from '@core/publicPages/application/pages/ApplicationForm/utils/CheckBoxRequirements'
import { DescriptionMinimalTiptapEditor } from '@tumaet/prompt-ui-components'

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
  dragHandleProps?: DraggableProvidedDragHandleProps | null
}

export const ApplicationQuestionCard = forwardRef<
  ApplicationQuestionCardRef | undefined, // or null if you prefer
  ApplicationQuestionCardProps
>(function ApplicationQuestionCard(
  { question, index, originalQuestion, onUpdate, submitAttempted, onDelete, dragHandleProps },
  ref,
) {
  const isNewQuestion = question.title === '' ? true : false
  const [isExpanded, setIsExpanded] = useState(isNewQuestion)
  const isMultiSelectType = 'options' in question
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  // if a rich text is entered -> start with rich text editor
  const [useRichInput, setUseRichInput] = useState(question.description?.startsWith('<'))

  const status: QuestionStatus = originalQuestion
    ? questionsEqual(question, originalQuestion)
      ? 'saved'
      : 'modified'
    : 'new'

  const form = useForm<QuestionConfigFormData>({
    resolver: zodResolver(questionConfigSchema),
    defaultValues: { type: isMultiSelectType ? 'multi-select' : 'text', ...question },
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

  const isCheckboxQuestion =
    isMultiSelectType && checkCheckBoxQuestion(question as ApplicationQuestionMultiSelect)
  const isActualMultiSelect = isMultiSelectType && !isCheckboxQuestion

  return (
    <>
      <Card
        className={`mb-4 ${submitAttempted && !form.formState.isValid ? 'border-red-500' : ''}`}
      >
        <CardHeader
          className='cursor-pointer'
          onClick={() => setIsExpanded(!isExpanded)}
          {...dragHandleProps} // This is the drag handle for the card
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <GripVertical className='cursor-move h-6 w-6 text-muted-foreground' />
              <div>
                <CardTitle>{question.title || `Untitled Question`}</CardTitle>
                <p className='text-sm text-muted-foreground mt-1'>
                  Question {index + 1}:{' '}
                  {isMultiSelectType
                    ? isCheckboxQuestion
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
                {/** For multi-select question the isRequired is controlled by min-select */}
                {!isActualMultiSelect && (
                  <FormField
                    control={form.control}
                    name='isRequired'
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
                )}
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
                      <div className='flex items-center justify-between'>
                        <FormLabel>Description</FormLabel>
                        <div className='flex items-center space-x-2'>
                          <Switch
                            checked={useRichInput}
                            onCheckedChange={setUseRichInput}
                            aria-label='Toggle between standard and rich input'
                          />
                          <span className='text-sm text-muted-foreground'>Rich Text Editor</span>
                        </div>
                      </div>
                      <FormControl>
                        {useRichInput ? (
                          <TooltipProvider>
                            <DescriptionMinimalTiptapEditor
                              {...field}
                              className='w-full'
                              editorContentClassName='p-3'
                              output='html'
                              placeholder='Type your description here...'
                              autofocus={false}
                              editable={true}
                              editorClassName='focus:outline-none'
                            />
                          </TooltipProvider>
                        ) : (
                          <Input {...field} placeholder='Enter description text' />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/** Checkbox Questions do not have a placeholder */}
                {!isCheckboxQuestion && (
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
                {/** For multi-select question there is no need to specify an error message - it will be determined by max and min error */}
                {!isActualMultiSelect && (
                  <FormField
                    control={form.control}
                    name='errorMessage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Error Message</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Enter error message' />
                        </FormControl>
                        <FormDescription>
                          {isCheckboxQuestion &&
                            'This message will be shown if the checkbox is not checked'}
                          {!isMultiSelectType &&
                            'This error message will be shown if the question does not match the validation regex. If regex is empty, this has no effect.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isMultiSelectType ? (
                  !isCheckboxQuestion && (
                    <MultiSelectConfig
                      form={form as UseFormReturn<QuestionConfigFormDataMultiSelect>}
                    />
                  )
                ) : (
                  <TextConfig form={form as UseFormReturn<QuestionConfigFormDataText>} />
                )}

                <Separator />
                <div className='space-y-2'>
                  <h2 className='text-lg font-semibold'>Export Settings</h2>
                  <FormField
                    control={form.control}
                    name='accessibleForOtherPhases'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>Accessible for Other Phases</FormLabel>
                          <FormDescription>
                            Allow this question to be accessed in other application phases
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-label='Toggle accessibility for other phases'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch('accessibleForOtherPhases') && (
                    <FormField
                      control={form.control}
                      name='accessKey'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='Enter access key' />
                          </FormControl>
                          <FormDescription>
                            Provide a unique key to identify this question when accessing it from
                            other phases
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
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
