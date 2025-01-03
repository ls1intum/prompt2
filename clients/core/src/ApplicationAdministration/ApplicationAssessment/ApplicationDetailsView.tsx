import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GetApplication } from '@/interfaces/get_application'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getApplicationAssessment } from '../../network/queries/applicationAssessment'
import { ApplicationForm } from '@/interfaces/application_form'
import { getApplicationForm } from '../../network/queries/applicationForm'
import { ApplicationFormView } from '../../Application/ApplicationFormView'
import { MissingUniversityData } from './components/MissingUniversityData'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import { getStatusBadge } from './utils/getStatusBadge'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { InstructorComment } from '@/interfaces/instructor_comment'

interface ApplicationDetailsViewProps {
  coursePhaseParticipationID: string
  open: boolean
  status: PassStatus
  score: number | null
  metaData: { [key: string]: any }
  onClose: () => void
}

export const ApplicationDetailsView = ({
  coursePhaseParticipationID,
  open,
  status,
  score,
  metaData,
  onClose,
}: ApplicationDetailsViewProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: fetchedApplication,
    isPending: isFetchingApplication,
    isError: isApplicationError,
    refetch: refetchApplication,
  } = useQuery<GetApplication>({
    queryKey: ['application', coursePhaseParticipationID],
    queryFn: () => getApplicationAssessment(phaseId ?? '', coursePhaseParticipationID),
  })

  const {
    data: fetchedApplicationForm,
    isPending: isFetchingApplicationForm,
    isError: isApplicationFormError,
    refetch: refetchApplicationForm,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', phaseId],
    queryFn: () => getApplicationForm(phaseId ?? ''),
  })

  const comments = metaData.comments as InstructorComment[]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl w-full max-h-[90vh] flex flex-col'>
        {(isFetchingApplication || isFetchingApplicationForm) && (
          <div className='flex justify-center items-center flex-grow'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
          </div>
        )}
        <DialogHeader>
          <DialogTitle>
            {fetchedApplication?.student?.first_name} {fetchedApplication?.student?.last_name}{' '}
          </DialogTitle>
          <DialogDescription>{getStatusBadge(status)}</DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-4'>
            {(isApplicationError || isApplicationFormError) && (
              <ErrorPage
                onRetry={() => {
                  refetchApplication()
                  refetchApplicationForm()
                }}
              />
            )}
            {(isFetchingApplication || isFetchingApplicationForm) && (
              <div className='flex justify-center items-center flex-grow'>
                <Loader2 className='h-12 w-12 animate-spin text-primary' />
              </div>
            )}
            {fetchedApplication &&
              fetchedApplication.student &&
              !fetchedApplication.student.has_university_account && (
                <MissingUniversityData student={fetchedApplication.student} />
              )}
            {!isFetchingApplication &&
              fetchedApplication &&
              fetchedApplicationForm &&
              fetchedApplication.student && (
                <ApplicationFormView
                  questionsText={fetchedApplicationForm.questions_text}
                  questionsMultiSelect={fetchedApplicationForm.questions_multi_select}
                  initialAnswersText={fetchedApplication.answers_text}
                  initialAnswersMultiSelect={fetchedApplication.answers_multi_select}
                  student={fetchedApplication.student}
                  disabled={true}
                  onSubmit={() => console.log('submit')}
                />
              )}

            <Card className='mt-6'>
              <CardContent className='pt-6'>
                <CardTitle className='mb-4'>Assessment</CardTitle>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='new-score' className='mb-2 block'>
                      Assessment Score
                    </Label>
                    <div className='flex items-center space-x-2'>
                      <Input
                        id='new-score'
                        title='Assessment Score'
                        type='number'
                        defaultValue={score ?? 0}
                        className='w-24'
                        placeholder='New score'
                      />
                    </div>
                    <Button>Submit</Button>
                  </div>
                  <Separator className='my-4' />
                  <div className='flex space-x-2'></div>
                  <Label htmlFor='new-score' className='mb-2 block'>
                    Additional Comments
                  </Label>
                  {comments !== undefined && comments.length > 0 && (
                    <div className='space-y-2'>
                      {comments.map((comment, index) => (
                        <div key={index} className='border p-2 rounded-md'>
                          <p className='text-sm text-gray-600'>
                            <strong>{comment.author}</strong>{' '}
                            {comment.timestamp && `- ${comment.timestamp}`}
                          </p>
                          <p>{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter>
          <Button variant='destructive' className='flex-1'>
            Reject
          </Button>
          <Button variant='default' className='flex-1'>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
