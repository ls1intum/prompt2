import { useParams, useNavigate } from 'react-router-dom'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { useMutation, useQuery } from '@tanstack/react-query'
import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'
import { ApplicationHeader } from './components/ApplicationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { useState } from 'react'
import { ApplicationLoginCard } from './components/ApplicationLoginCard'
import { ApplicationForm } from './ApplicationForm'
import { Student } from '@/interfaces/student'
import { CreateApplicationAnswerText } from '@/interfaces/application_answer_text'
import { CreateApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'
import { PostApplication } from '@/interfaces/post_application'
import { postNewApplicationExtern } from '../network/mutations/postApplicationExtern'
import { ApplicationSavingDialog } from './components/ApplicationSavingDialog'

export const ApplicationLoginPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const navigate = useNavigate()
  const [selectedContinueAsExternal, setSelectedContinueAsExternal] = useState(false)
  const [showDialog, setShowDialog] = useState<'saving' | 'success' | 'error' | null>(null)

  const {
    data: applicationForm,
    isPending,
    isError,
    error,
  } = useQuery<ApplicationFormWithDetails>({
    queryKey: ['applicationForm', phaseId],
    queryFn: () => getApplicationFormWithDetails(phaseId ?? ''),
  })

  const { mutate: mutateSendApplication, error: mutateError } = useMutation({
    mutationFn: (application: PostApplication) => {
      return postNewApplicationExtern(phaseId ?? 'undefined', application)
    },
    onSuccess: () => {
      setShowDialog('success')
    },
    onError: () => {
      setShowDialog('error')
    },
  })

  const handleSubmit = (
    student: Student,
    answersText: CreateApplicationAnswerText[],
    answersMultiSelect: CreateApplicationAnswerMultiSelect[],
  ) => {
    const application: PostApplication = {
      student,
      answers_text: answersText,
      answers_multi_select: answersMultiSelect,
    }
    setShowDialog('saving')
    mutateSendApplication(application)
  }

  const handleCloseDialog = () => {
    setShowDialog(null)
  }

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
            onSubmit={handleSubmit}
          />
        )}
      </div>
      <ApplicationSavingDialog
        showDialog={showDialog}
        onClose={handleCloseDialog}
        onNavigateBack={() => navigate('/')}
        errorMessage={mutateError?.message}
      />
    </NonAuthenticatedPageWrapper>
  )
}
