import { useNavigate, useParams } from 'react-router-dom'
import { AuthenticatedPageWrapper } from '../components/AuthenticatedPageWrapper'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { useQuery } from '@tanstack/react-query'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { LoadingState } from './components/LoadingState'
import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'
import { ErrorState } from './components/ErrorState'
import { ApplicationHeader } from './components/ApplicationHeader'
import { ApplicationForm } from './ApplicationForm'
import { useAuthStore } from '@/zustand/useAuthStore'
import { Student } from '@/interfaces/student'

export const ApplicationAuthenticated = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // This data should already be fetched in the Login Page, but this page could also be loaded from a direct link
  const {
    data: applicationForm,
    isPending,
    isError,
    error,
  } = useQuery<ApplicationFormWithDetails>({
    queryKey: ['applicationForm', phaseId],
    queryFn: () => getApplicationFormWithDetails(phaseId ?? ''),
  })

  // TODO: mutate function with authenticated Instance!!

  if (isPending) {
    return (
      <AuthenticatedPageWrapper withLoginButton={false}>
        <LoadingState />
      </AuthenticatedPageWrapper>
    )
  }

  if (isError || !applicationForm) {
    return (
      <NonAuthenticatedPageWrapper withLoginButton={false}>
        <ErrorState error={error} onBack={() => navigate('/')} />
      </NonAuthenticatedPageWrapper>
    )
  }

  const { application_phase } = applicationForm

  // TODO -> try to get student with email from server. Else use the user from the auth store
  const student: Student = {
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    email: user?.email ?? '',
    has_university_account: true,
  }

  return (
    <AuthenticatedPageWrapper withLoginButton={false}>
      <div className='max-w-4xl mx-auto space-y-6'>
        <ApplicationHeader applicationPhase={application_phase} />
        <ApplicationForm
          questionsText={applicationForm.questions_text}
          questionsMultiSelect={applicationForm.questions_multi_select}
          student={student}
          onSubmit={() => console.log('Submit')}
        />
      </div>
    </AuthenticatedPageWrapper>
  )
}
