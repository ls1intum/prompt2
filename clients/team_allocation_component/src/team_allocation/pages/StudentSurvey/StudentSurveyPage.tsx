import { ErrorPage } from '@/components/ErrorPage'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useQuery } from '@tanstack/react-query'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { SurveyForm } from 'src/team_allocation/interfaces/surveyForm'
import { SurveyResponse } from 'src/team_allocation/interfaces/surveyResponse'
import { getSurveyForm } from 'src/team_allocation/network/queries/getSurveyForm'
import { getSurveyOwnResponse } from 'src/team_allocation/network/queries/getSurveyOwnResponse'

export const StudentSurveyPage = (): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  // getting the form questions
  const {
    data: fetchedSurveyForm,
    isPending: isSurveyFormPending,
    isError: isSurveyFormError,
    error: surveyFormError,
    refetch: refetchSurveyForm,
  } = useQuery<SurveyForm | undefined>({
    queryKey: ['team_allocation_survey_form', phaseId], // TODO also update on skill / teams change
    queryFn: () => getSurveyForm(phaseId ?? ''),
  })

  // Get the students answers
  const {
    data: fetchedStudentSurveyResponse,
    isPending: isStudentSurveyResponsePending,
    isError: isStudentSurveyResponseError,
    refetch: refetchStudentSurveyResponse,
  } = useQuery<SurveyResponse>({
    queryKey: ['team_allocation_student_survey_response', phaseId],
    queryFn: () => getSurveyOwnResponse(phaseId ?? ''),
    enabled: isStudent,
  })

  const isPending = isSurveyFormPending || isStudentSurveyResponsePending
  const isError = isSurveyFormError || isStudentSurveyResponseError
  const surveyNotStarted = fetchedSurveyForm === undefined

  if (isError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchSurveyForm()
          refetchStudentSurveyResponse()
        }}
      />
    )
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>Your are not a student of this course.</AlertTitle>
          <AlertDescription>
            The following components are disabled because you are not a student of this course. For
            configuring this view, please refer to the Intro Course in the Tutor Course.
          </AlertDescription>
        </Alert>
      )}

      {surveyNotStarted && <>TODO: Display that survey has not yet started</>}

      {fetchedSurveyForm && fetchedStudentSurveyResponse && <>TODO: Survey here!!1</>}
    </>
  )
}
