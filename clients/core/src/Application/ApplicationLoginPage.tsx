import { useParams, useNavigate } from 'react-router-dom'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { useQuery } from '@tanstack/react-query'
import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'
import { ApplicationHeader } from './components/ApplicationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { useState } from 'react'
import { ApplicationLoginCard } from './components/ApplicationLoginCard'
import { ApplicationForm } from './ApplicationForm'

export const ApplicationLoginPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const navigate = useNavigate()
  const [selectedContinueAsExternal, setSelectedContinueAsExternal] = useState(false)

  const {
    data: applicationForm,
    isPending,
    isError,
    error,
  } = useQuery<ApplicationFormWithDetails>({
    queryKey: ['applicationForm', phaseId],
    queryFn: () => getApplicationFormWithDetails(phaseId ?? ''),
  })

  if (isPending) {
    return (
      <NonAuthenticatedPageWrapper withLoginButton={false}>
        <LoadingState />
      </NonAuthenticatedPageWrapper>
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
  const externalStudentsAllowed = application_phase.externalStudentsAllowed

  return (
    <NonAuthenticatedPageWrapper withLoginButton={false}>
      <div className='max-w-4xl mx-auto space-y-6'>
        <ApplicationHeader applicationPhase={application_phase} />
        {!selectedContinueAsExternal && (
          <ApplicationLoginCard
            externalStudentsAllowed={externalStudentsAllowed}
            onContinueAsExtern={() => setSelectedContinueAsExternal(true)}
          />
        )}
        {/** display non authenticated applicationForm here */}
        {externalStudentsAllowed && selectedContinueAsExternal && (
          <ApplicationForm
            questionsText={applicationForm.questions_text}
            questionsMultiSelect={applicationForm.questions_multi_select}
            onSubmit={() => console.log('Submit')}
          />
        )}
      </div>
    </NonAuthenticatedPageWrapper>
  )
}
