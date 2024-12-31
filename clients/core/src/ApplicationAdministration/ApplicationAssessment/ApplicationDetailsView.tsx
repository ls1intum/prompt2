import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ApplicationDetailsViewProps {
  coursePhaseParticipationID: string
  open: boolean
  status: PassStatus
  onClose: () => void
}

export const ApplicationDetailsView = ({
  coursePhaseParticipationID,
  open,
  status,
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
