import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import {
  ApplicationQuestionCard,
  ApplicationQuestionCardRef,
} from './components/ApplicationQuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useRef, useState } from 'react'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { useParams } from 'react-router-dom'
import { SaveChangesAlert } from '@/components/SaveChangesAlert'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApplicationForm, UpdateApplicationForm } from '@/interfaces/application_form'
import { getApplicationForm } from '../../../network/queries/applicationForm'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { updateApplicationForm } from '../../../network/mutations/updateApplicationForm'

export const ApplicationQuestionConfig = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [applicationQuestions, setApplicationQuestions] = useState<
    (ApplicationQuestionText | ApplicationQuestionMultiSelect)[]
  >([])
  const [questionsModified, setQuestionsModified] = useState(false)
  const questionRefs = useRef<Array<ApplicationQuestionCardRef | null | undefined>>([])
  // required to highlight questions red if submit is attempted and not valid
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: fetchedForm,
    isPending: isApplicationFormPending,
    isError: isApplicationFormError,
    error: applicationFormError,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', phaseId],
    queryFn: () => getApplicationForm(phaseId ?? 'undefined'),
  })

  const {
    mutate: mutateApplicationForm,
    isError: isMutateError,
    error: mutateError,
    isPending: isMutatePending,
  } = useMutation({
    mutationFn: (updateForm: UpdateApplicationForm) => {
      return updateApplicationForm(phaseId ?? 'undefined', updateForm)
    },
    onSuccess: () => {
      // invalidate query
      queryClient.invalidateQueries({ queryKey: ['application_form', phaseId] })
      setQuestionsModified(false)
      // close this window
    },
  })

  const setQuestionsFromForm = (form: ApplicationForm) => {
    const combinedQuestions: (ApplicationQuestionText | ApplicationQuestionMultiSelect)[] = [
      ...form.questions_multi_select,
      ...form.questions_text,
    ]

    // Sort the combined questions by ordernum
    combinedQuestions.sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))

    setApplicationQuestions(combinedQuestions)
  }

  useEffect(() => {
    if (fetchedForm) {
      console.log(fetchedForm)
      setQuestionsFromForm(fetchedForm)
    }
  }, [fetchedForm])

  const handleAddNewQuestionText = () => {
    const newQuestion: ApplicationQuestionText = {
      id: `not-valid-id-question-${applicationQuestions.length + 1}`,
      title: ``,
      course_phase_id: phaseId!,
      is_required: false,
      order_num: applicationQuestions.length + 1,
      allowed_length: 500,
    }
    setApplicationQuestions([...applicationQuestions, newQuestion])
    setQuestionsModified(true)
  }

  const handleAddNewQuestionMultiSelect = () => {
    const newQuestion: ApplicationQuestionMultiSelect = {
      id: `not-valid-id-question-${applicationQuestions.length + 1}`,
      title: ``,
      course_phase_id: phaseId!,
      is_required: false,
      order_num: applicationQuestions.length + 1,
      min_select: 0,
      max_select: 0,
      options: [],
    }
    setApplicationQuestions([...applicationQuestions, newQuestion])
    setQuestionsModified(true)
  }

  const handleQuestionUpdate = (
    updatedQuestion: ApplicationQuestionText | ApplicationQuestionMultiSelect,
  ) => {
    setApplicationQuestions((prev) => {
      return prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    })
    setQuestionsModified(true)
  }

  const handleSubmitAllQuestions = async () => {
    let allValid = true

    // Loop over each child's ref, call validate()
    for (const ref of questionRefs.current) {
      if (!ref) continue
      const isValid = await ref.validate()
      if (!isValid) {
        allValid = false
      }
    }
    setSubmitAttempted(true)
    if (allValid) {
      const deletedTextQuestion = fetchedForm?.questions_text
        .filter((q) => !applicationQuestions.some((aq) => aq.id === q.id))
        .map((q) => q.id)

      const deletedMultiSelectQuestion = fetchedForm?.questions_multi_select
        .filter((q) => !applicationQuestions.some((aq) => aq.id === q.id))
        .map((q) => q.id)

      const questions_multi_select = applicationQuestions
        .filter((q) => 'options' in q)
        .map((q) => q as ApplicationQuestionMultiSelect)

      const questions_text = applicationQuestions
        .filter((q) => !('options' in q))
        .map((q) => q as ApplicationQuestionText)

      const updateForm: UpdateApplicationForm = {
        delete_questions_text: deletedTextQuestion ?? [],
        delete_questions_multi_select: deletedMultiSelectQuestion ?? [],
        create_questions_text: questions_text.filter((q) =>
          q.id.startsWith('not-valid-id-question-'),
        ),
        create_questions_multi_select: questions_multi_select.filter((q) =>
          q.id.startsWith('not-valid-id-question-'),
        ),
        update_questions_text: questions_text.filter(
          (q) => !q.id.startsWith('not-valid-id-question-'),
        ),
        update_questions_multi_select: questions_multi_select.filter(
          (q) => !q.id.startsWith('not-valid-id-question-'),
        ),
      }
      mutateApplicationForm(updateForm)
      console.log(true)
    } else {
      throw new Error('Not all questions are valid')
    }
  }

  const handleRevertAllQuestions = () => {
    // TODO revert all questions
    console.log('revert all questions')
    setQuestionsModified(false)
    if (fetchedForm) {
      setQuestionsFromForm(fetchedForm)
    }
  }

  const handleDeleteQuestion = (id: string) => {
    // TODO: sync with server
    setApplicationQuestions((prev) => prev.filter((q) => q.id !== id))
    setQuestionsModified(true)
  }

  if (isApplicationFormPending || isApplicationFormError || isMutatePending || isMutateError) {
    return (
      <div className='space-y-6 max-w-4xl mx-auto'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-semibold'>Application Questions</h2>
        </div>
        {(isApplicationFormPending || isMutatePending) && (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        )}
        {(isApplicationFormError || isMutateError) && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {applicationFormError instanceof Error
                ? applicationFormError.message
                : 'An error occurred while fetching the application form.'}
              {mutateError instanceof Error
                ? mutateError.message
                : 'An error occurred while updating the application form.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-semibold'>Application Questions</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Add Question
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onSelect={() => handleAddNewQuestionText()}>
              Text Question
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddNewQuestionMultiSelect()}>
              Multi-Select Question
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {questionsModified && (
        <SaveChangesAlert
          message='You have unsaved changes'
          handleRevert={handleRevertAllQuestions}
          saveChanges={handleSubmitAllQuestions}
        />
      )}
      {applicationQuestions.length > 0 ? (
        applicationQuestions.map((question, index) => (
          <ApplicationQuestionCard
            key={question.id}
            question={question}
            index={index}
            onUpdate={handleQuestionUpdate}
            ref={(el) => (questionRefs.current[index] = el)}
            submitAttempted={submitAttempted}
            onDelete={handleDeleteQuestion}
          />
        ))
      ) : (
        <Card>
          <CardContent className='text-center py-8'>
            <p className='text-lg mb-4'>No questions added yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
