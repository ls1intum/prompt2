import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { GetApplication } from '@core/interfaces/application/getApplication'
import { getApplicationAssessment } from '@core/network/queries/applicationAssessment'
import { ApplicationForm } from '../../../../interfaces/form/applicationForm'
import { getApplicationForm } from '@core/network/queries/applicationForm'
import { MissingUniversityData } from './components/MissingUniversityData'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { AssessmentCard } from './components/AssessmentCard'
import { ApplicationAnswersTable } from '../table/ApplicationAnswersTable'
import { StudentProfile } from '@/components/StudentProfile'
import { useApplicationStore } from '@core/managementConsole/applicationAdministration/zustand/useApplicationStore'

export const ApplicationDetailsPage = () => {
  const { phaseId, participationId } = useParams<{ phaseId: string; participationId: string }>()
  const { participations } = useApplicationStore()

  const participation = participations.find((p) => p.courseParticipationID === participationId)
  const status = participation?.passStatus
  const score = participation?.score ?? null
  const restrictedData = participation?.restrictedData ?? {}

  const {
    data: fetchedApplication,
    isPending: isFetchingApplication,
    isError: isApplicationError,
    refetch: refetchApplication,
  } = useQuery<GetApplication>({
    queryKey: ['application', participationId],
    queryFn: () => getApplicationAssessment(phaseId ?? '', participationId ?? ''),
    enabled: !!phaseId && !!participationId,
  })

  const {
    data: fetchedApplicationForm,
    isPending: isFetchingApplicationForm,
    isError: isApplicationFormError,
    refetch: refetchApplicationForm,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', phaseId],
    queryFn: () => getApplicationForm(phaseId ?? ''),
    enabled: !!phaseId,
  })

  if (isApplicationError || isApplicationFormError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchApplication()
          refetchApplicationForm()
        }}
      />
    )
  }

  if (isFetchingApplication || isFetchingApplicationForm) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
          <span className='text-sm text-muted-foreground'>Loading application details...</span>
        </div>
      </div>
    )
  }

  if (!participation) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-muted-foreground'>Application not found</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {fetchedApplication?.student && status && (
        <StudentProfile student={fetchedApplication.student} status={status} />
      )}

      {fetchedApplication?.student && !fetchedApplication.student.hasUniversityAccount && (
        <MissingUniversityData student={fetchedApplication.student} />
      )}

      {fetchedApplication && fetchedApplicationForm && (
        <ApplicationAnswersTable
          questions={[
            ...fetchedApplicationForm.questionsMultiSelect,
            ...fetchedApplicationForm.questionsText,
          ]}
          answersMultiSelect={fetchedApplication.answersMultiSelect}
          answersText={fetchedApplication.answersText}
        />
      )}

      {status && (
        <AssessmentCard
          score={score}
          restrictedData={restrictedData}
          acceptanceStatus={status}
          courseParticipationID={participationId ?? ''}
        />
      )}
    </div>
  )
}
