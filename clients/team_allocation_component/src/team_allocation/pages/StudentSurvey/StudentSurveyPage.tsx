import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertTriangle, Info } from 'lucide-react'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import type { SurveyForm } from '../../interfaces/surveyForm'
import type { SurveyResponse } from '../../interfaces/surveyResponse'
import { getSurveyForm } from '../../network/queries/getSurveyForm'
import { getSurveyOwnResponse } from '../../network/queries/getSurveyOwnResponse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SurveyFormComponent } from './components/SurveyForm'
import { ErrorPage } from '@/components/ErrorPage'

export const StudentSurveyPage = (): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  // Get the survey form (teams & skills)
  const {
    data: fetchedSurveyForm,
    isPending: isSurveyFormPending,
    isError: isSurveyFormError,
    refetch: refetchSurveyForm,
  } = useQuery<SurveyForm | undefined>({
    queryKey: ['team_allocation_survey_form', phaseId], // TODO also update on skill / teams change
    queryFn: () => getSurveyForm(phaseId ?? ''),
  })

  // Get the student's saved response, if any
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
      <div className='container mx-auto px-4 py-16 flex flex-col items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary mb-4' />
        <p className='text-muted-foreground animate-pulse'>Loading survey data...</p>
      </div>
    )
  }

  return (
    <div className='px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold'>Team Allocation Survey</h1>
        <p className='text-muted-foreground'>
          Complete this survey to help us assign you to the most suitable team.
        </p>
      </div>

      {!isStudent && (
        <Alert variant='destructive' className='mb-8'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            The survey is disabled because you are not a student of this course.
          </AlertDescription>
        </Alert>
      )}

      {surveyNotStarted && (
        <Card className='mb-8'>
          <CardHeader className='bg-muted/50'>
            <CardTitle className='flex items-center gap-2'>
              <Info className='h-5 w-5 text-muted-foreground' />
              Survey Not Available
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-center'>The survey has not yet started. Please check back later.</p>
          </CardContent>
        </Card>
      )}

      {fetchedSurveyForm && (
        <SurveyFormComponent
          surveyForm={fetchedSurveyForm}
          surveyResponse={fetchedStudentSurveyResponse}
          isStudent={isStudent}
        />
      )}
    </div>
  )
}
