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

export const ApplicationAuthenticated = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
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

  return (
    <AuthenticatedPageWrapper withLoginButton={false}>
      <div className='max-w-4xl mx-auto space-y-6'>
        <ApplicationHeader applicationPhase={application_phase} />
        <ApplicationForm
          questionsText={applicationForm.questions_text}
          questionsMultiSelect={applicationForm.questions_multi_select}
          onSubmit={() => console.log('Submit')}
        />
      </div>
    </AuthenticatedPageWrapper>
  )
}
