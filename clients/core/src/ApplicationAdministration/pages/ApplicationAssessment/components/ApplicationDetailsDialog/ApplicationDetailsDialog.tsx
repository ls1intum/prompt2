import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GetApplication } from '@/interfaces/get_application'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getApplicationAssessment } from '../../../../../network/queries/applicationAssessment'
import { ApplicationForm } from '@/interfaces/application_form'
import { getApplicationForm } from '../../../../../network/queries/applicationForm'
import { MissingUniversityData } from './components/MissingUniversityData'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { PassStatus } from '@/interfaces/course_phase_participation'

import { AssessmentCard } from './components/AssessmentCard'
import { ApplicationAssessment } from '@/interfaces/application_assessment'
import { postApplicationAssessment } from '../../../../../network/mutations/postApplicationAssessment'
import { InstructorComment } from '@/interfaces/instructor_comment'
import { useAuthStore } from '@/zustand/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { StudentProfile } from '@/components/StudentProfile'
import { ApplicationAnswersTable } from '../table/ApplicationAnswersTable'

interface ApplicationDetailsDialogProps {
  coursePhaseParticipationID: string
  open: boolean
  status: PassStatus
  score: number | null
  metaData: { [key: string]: any }
  onClose: () => void
}

export const ApplicationDetailsDialog = ({
  coursePhaseParticipationID,
  open,
  status,
  score,
  metaData,
  onClose,
}: ApplicationDetailsDialogProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { toast } = useToast()

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
      toast({
        title: 'Failed to Store Assessment',
        description: 'Please try again later!',
        variant: 'destructive',
      })
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
      <DialogContent className='max-w-8xl w-full max-h-[90vh] max-w-[90vw] flex flex-col'>
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
                <>
                  <StudentProfile student={fetchedApplication.student} status={status} />
                  <ApplicationAnswersTable
                    questions={[
                      ...fetchedApplicationForm.questions_multi_select,
                      ...fetchedApplicationForm.questions_text,
                    ]}
                    answers_multi_select={fetchedApplication.answers_multi_select}
                    answers_text={fetchedApplication.answers_text}
                  />
                </>
              )}

            <AssessmentCard
              score={score}
              metaData={metaData}
              acceptanceStatus={status}
              handleAcceptanceStatusChange={handleAcceptanceStatusChange}
              onScoreSubmission={handleScoreSubmit}
              onCommentSubmission={handleCommentSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
