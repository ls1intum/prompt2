import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GetApplication } from '@core/interfaces/application/getApplication'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getApplicationAssessment } from '@core/network/queries/applicationAssessment'
import { ApplicationForm } from '../../../../interfaces/form/applicationForm'
import { getApplicationForm } from '@core/network/queries/applicationForm'
import { MissingUniversityData } from './components/MissingUniversityData'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { PassStatus } from '@tumaet/prompt-shared-state'

import { AssessmentCard } from './components/AssessmentCard'
import { ApplicationAssessment } from '../../../../interfaces/applicationAssessment'
import { postApplicationAssessment } from '@core/network/mutations/postApplicationAssessment'
import { InstructorComment } from '../../../../interfaces/instructorComment'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { useToast } from '@/hooks/use-toast'
import { StudentProfile } from '@/components/StudentProfile'
import { ApplicationAnswersTable } from '../table/ApplicationAnswersTable'

interface ApplicationDetailsDialogProps {
  coursePhaseParticipationID: string
  open: boolean
  status: PassStatus
  score: number | null
  restrictedData: { [key: string]: any }
  onClose: () => void
}

export const ApplicationDetailsDialog = ({
  coursePhaseParticipationID,
  open,
  status,
  score,
  restrictedData,
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
    const comments = (restrictedData.comments || []) as InstructorComment[]
    comments.push({
      text: comment,
      timestamp: new Date().toISOString(),
      author: `${user?.firstName} ${user?.lastName}`,
    })
    const assessment: ApplicationAssessment = {
      restrictedData: {
        comments,
      },
    }
    mutateAssessment(assessment)
  }

  const handleAcceptanceStatusChange = (newStatus: PassStatus) => {
    const assessment: ApplicationAssessment = {
      passStatus: newStatus,
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
            {fetchedApplication?.student?.firstName} {fetchedApplication?.student?.lastName}{' '}
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
              !fetchedApplication.student.hasUniversityAccount && (
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
                      ...fetchedApplicationForm.questionsMultiSelect,
                      ...fetchedApplicationForm.questionsText,
                    ]}
                    answersMultiSelect={fetchedApplication.answersMultiSelect}
                    answersText={fetchedApplication.answersText}
                  />
                </>
              )}

            <AssessmentCard
              score={score}
              restrictedData={restrictedData}
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
