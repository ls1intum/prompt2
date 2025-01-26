import { useParams } from 'react-router-dom'
import { AuthenticatedPageWrapper } from '../../../shared/components/AuthenticatedPageWrapper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApplicationFormWithDetails } from '@core/network/queries/applicationFormWithDetails'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { ApplicationHeader } from '../../components/ApplicationHeader'
import { ApplicationFormView } from '../ApplicationForm/ApplicationFormView'
import { useAuthStore } from '@/zustand/useAuthStore'
import { getApplication } from '@core/network/queries/application'
import { postNewApplicationAuthenticated } from '@core/network/mutations/postApplicationAuthenticated'
import { useState } from 'react'
import { ApplicationSavingDialog } from '../../components/ApplicationSavingDialog'
import { InfoBanner } from './components/InfoBanner'
import { Student } from '@tumaet/prompt-shared-state'
import { GetApplication } from '@core/interfaces/application/getApplication'
import { PostApplication } from '@core/interfaces/application/postApplication'
import { CreateApplicationAnswerText } from '@core/interfaces/application/applicationAnswer/text/createApplicationAnswerText'
import { CreateApplicationAnswerMultiSelect } from '@core/interfaces/application/applicationAnswer/multiSelect/createApplicationAnswerMultiSelect'
import { ApplicationFormWithDetails } from '@core/interfaces/application/applicationFormWithDetails'

export const ApplicationAuthenticated = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { user, logout } = useAuthStore()
  const [showDialog, setShowDialog] = useState<'saving' | 'success' | 'error' | null>(null)
  const queryClient = useQueryClient()

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

  const {
    data: application,
    isPending: isApplicationPending,
    isError: isApplicationError,
    error: applicationError,
  } = useQuery<GetApplication>({
    queryKey: ['application', phaseId, user?.email],
    queryFn: () => getApplication(phaseId ?? ''),
  })

  const { mutate: mutateSendApplication, error: mutateError } = useMutation({
    mutationFn: (modifiedApplication: PostApplication) => {
      return postNewApplicationAuthenticated(phaseId ?? 'undefined', modifiedApplication)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', phaseId, user?.email] })
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
    const modifiedApplication: PostApplication = {
      student,
      answersText: answersText,
      answersMultiSelect: answersMultiSelect,
    }
    setShowDialog('saving')
    mutateSendApplication(modifiedApplication)
  }

  const handleCloseDialog = () => {
    setShowDialog(null)
  }

  const handleBack = () => {
    logout()
  }

  if (isPending || isApplicationPending) {
    return (
      <AuthenticatedPageWrapper withLoginButton={false}>
        <LoadingState />
      </AuthenticatedPageWrapper>
    )
  }

  if (isError || !applicationForm) {
    return (
      <AuthenticatedPageWrapper withLoginButton={false}>
        <ErrorState error={error} onBack={handleBack} />
      </AuthenticatedPageWrapper>
    )
  }

  if (isApplicationError || !application) {
    return (
      <AuthenticatedPageWrapper withLoginButton={false}>
        <ErrorState error={applicationError} onBack={handleBack} />
      </AuthenticatedPageWrapper>
    )
  }

  const { applicationPhase } = applicationForm

  let student: Student = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    matriculationNumber: user?.matriculationNumber ?? '',
    universityLogin: user?.universityLogin ?? '',
    hasUniversityAccount: true,
  }
  if (
    (application.status === 'applied' || application.status === 'not_applied') &&
    application.student
  ) {
    student = application.student
    // enforcing that student has university account
    student.hasUniversityAccount = true
  }

  return (
    <AuthenticatedPageWrapper withLoginButton={false}>
      <div className='max-w-4xl mx-auto space-y-6'>
        <ApplicationHeader applicationPhase={applicationPhase} onBackClick={handleBack} />
        <InfoBanner status={application.status} />
        <ApplicationFormView
          questionsText={applicationForm.questionsText}
          questionsMultiSelect={applicationForm.questionsMultiSelect}
          initialAnswersMultiSelect={application.answersMultiSelect}
          initialAnswersText={application.answersText}
          student={student}
          onSubmit={handleSubmit}
        />
      </div>
      <ApplicationSavingDialog
        showDialog={showDialog}
        onClose={handleCloseDialog}
        onNavigateBack={handleBack}
        errorMessage={mutateError?.message}
      />
    </AuthenticatedPageWrapper>
  )
}
