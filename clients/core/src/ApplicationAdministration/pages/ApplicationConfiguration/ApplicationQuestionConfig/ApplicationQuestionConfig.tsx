import { AlertCircle, Loader2 } from 'lucide-react'
import {
  ApplicationQuestionCard,
  ApplicationQuestionCardRef,
} from './FormPages/ApplicationQuestionCard'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useRef, useState } from 'react'
import { ApplicationQuestionText } from '@/interfaces/application_question_text'
import { ApplicationQuestionMultiSelect } from '@/interfaces/application_question_multi_select'
import { useParams } from 'react-router-dom'
import { SaveChangesAlert } from '@/components/SaveChangesAlert'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApplicationForm, UpdateApplicationForm } from '@/interfaces/application_form'
import { getApplicationForm } from '../../../../network/queries/applicationForm'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { updateApplicationForm } from '../../../../network/mutations/updateApplicationForm'
import { handleSubmitAllQuestions } from './handlers/handleSubmitAllQuestions'
import { computeQuestionsModified } from './handlers/computeQuestionsModified'
import { handleQuestionUpdate } from './handlers/handleQuestionUpdate'
import { AddQuestionMenu } from './components/AddQuestionMenu'
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd'
import { ApplicationPreview } from '../../../../Application/pages/ApplicationPreview/ApplicationPreview'

export const ApplicationQuestionConfig = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [applicationQuestions, setApplicationQuestions] = useState<
    (ApplicationQuestionText | ApplicationQuestionMultiSelect)[]
  >([])
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
  const originalQuestions = [
    ...(fetchedForm?.questions_multi_select ?? []),
    ...(fetchedForm?.questions_text ?? []),
  ]
  const questionsModified = computeQuestionsModified(fetchedForm, applicationQuestions)

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
      setQuestionsFromForm(fetchedForm)
    }
  }, [fetchedForm])

  const handleRevertAllQuestions = () => {
    if (fetchedForm) {
      setQuestionsFromForm(fetchedForm)
    }
  }

  const handleDeleteQuestion = (id: string) => {
    setApplicationQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newQuestions = Array.from(applicationQuestions)
    const [reorderedItem] = newQuestions.splice(result.source.index, 1)
    newQuestions.splice(result.destination.index, 0, reorderedItem)

    // Update order_num for all questions
    const updatedQuestions = newQuestions.map((question, index) => ({
      ...question,
      order_num: index + 1,
    }))

    setApplicationQuestions(updatedQuestions)
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
        <ApplicationPreview
          questionsMultiSelect={applicationQuestions.filter((question) => 'options' in question)}
          questionsText={applicationQuestions.filter((question) => 'options' in question === false)}
        />
        <AddQuestionMenu
          setApplicationQuestions={setApplicationQuestions}
          applicationQuestions={applicationQuestions}
        />
      </div>
      {questionsModified && (
        <SaveChangesAlert
          message='You have unsaved changes'
          handleRevert={handleRevertAllQuestions}
          saveChanges={() =>
            handleSubmitAllQuestions({
              questionRefs,
              fetchedForm,
              applicationQuestions,
              setSubmitAttempted,
              mutateApplicationForm,
            })
          }
        />
      )}
      {applicationQuestions.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='questions'>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {applicationQuestions.map((question, index) => (
                  <Draggable key={question.id} draggableId={question.id} index={index}>
                    {(providedQuestionItem) => (
                      <div
                        ref={providedQuestionItem.innerRef}
                        {...providedQuestionItem.draggableProps}
                        {...providedQuestionItem.dragHandleProps}
                      >
                        <ApplicationQuestionCard
                          question={question}
                          originalQuestion={originalQuestions.find((q) => q.id === question.id)}
                          index={index}
                          onUpdate={(updatedQuestion) => {
                            handleQuestionUpdate(updatedQuestion, setApplicationQuestions)
                          }}
                          ref={(el) => (questionRefs.current[index] = el)}
                          submitAttempted={submitAttempted}
                          onDelete={handleDeleteQuestion}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
