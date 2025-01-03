import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GetApplication } from '@/interfaces/get_application'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/button'

import { AssessmentCard } from './components/AssessmentCard'
import { ApplicationAssessment } from '@/interfaces/application_assessment'
import { postApplicationAssessment } from '../../network/mutations/postApplicationAssessment'
import { InstructorComment } from '@/interfaces/instructor_comment'
import { useAuthStore } from '@/zustand/useAuthStore'

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
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

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

  const { mutate: mutateAssessment } = useMutation({
    mutationFn: (applicationAssessment: ApplicationAssessment) => {
      return postApplicationAssessment(
        phaseId ?? 'undefined',
        coursePhaseParticipationID,
        applicationAssessment,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application_participations'] })
    },
    onError: () => {
      // Handle error
      // TODO: add info banner
      console.log('Error')
    },
  })

  const handleScoreSubmit = (newScore: number) => {
    const assessment: ApplicationAssessment = {
      Score: newScore,
    }
    mutateAssessment(assessment)
  }

  const handleCommentSubmit = (comment: string) => {
    const comments = (metaData.comments || []) as InstructorComment[]
    comments.push({
      text: comment,
      timestamp: new Date().toISOString(),
      author: `${user?.firstName} ${user?.lastName}`,
    })
    const assessment: ApplicationAssessment = {
      meta_data: {
        comments,
      },
    }
    mutateAssessment(assessment)
  }

  const handleAcceptanceStatusChange = (newStatus: PassStatus) => {
    const assessment: ApplicationAssessment = {
      pass_status: newStatus,
    }
    mutateAssessment(assessment)
  }

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

            <AssessmentCard
              score={score}
              metaData={metaData}
              onScoreSubmission={handleScoreSubmit}
              onCommentSubmission={handleCommentSubmit}
            />
          </div>
        </div>
        <DialogFooter className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={status === PassStatus.FAILED}
            className='border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 hover:bg-red-50'
            onClick={() => handleAcceptanceStatusChange(PassStatus.FAILED)}
          >
            Decline
          </Button>
          <Button
            variant='default'
            size='sm'
            disabled={status === PassStatus.PASSED}
            className='bg-green-500 hover:bg-green-600'
            onClick={() => handleAcceptanceStatusChange(PassStatus.PASSED)}
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
