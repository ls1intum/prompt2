import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ErrorPage,
} from '@tumaet/prompt-ui-components'
import { GetApplication } from '@core/interfaces/application/getApplication'
import { getApplicationAssessment } from '@core/network/queries/applicationAssessment'
import { ApplicationForm } from '../../../../interfaces/form/applicationForm'
import { getApplicationForm } from '@core/network/queries/applicationForm'
import { MissingUniversityData } from './components/MissingUniversityData'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { AssessmentCard } from './components/AssessmentCard'
import { ApplicationAnswersTable } from '../table/ApplicationAnswersTable'
import { StudentProfile } from '@/components/StudentProfile'

interface ApplicationDetailsDialogProps {
  courseParticipationID: string
  open: boolean
  status: PassStatus
  score: number | null
  restrictedData: { [key: string]: any }
  onClose: () => void
}

export const ApplicationDetailsDialog = ({
  courseParticipationID,
  open,
  status,
  score,
  restrictedData,
  onClose,
}: ApplicationDetailsDialogProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: fetchedApplication,
    isPending: isFetchingApplication,
    isError: isApplicationError,
    refetch: refetchApplication,
  } = useQuery<GetApplication>({
    queryKey: ['application', courseParticipationID],
    queryFn: () => getApplicationAssessment(phaseId ?? '', courseParticipationID),
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
              courseParticipationID={courseParticipationID}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
