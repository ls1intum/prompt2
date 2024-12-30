import { useParams } from 'react-router-dom'
import { AuthenticatedPageWrapper } from '../components/AuthenticatedPageWrapper'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'
import { ApplicationHeader } from './components/ApplicationHeader'
import { ApplicationFormView } from './ApplicationFormView'
import { useAuthStore } from '@/zustand/useAuthStore'
import { Student } from '@/interfaces/student'
import { getApplication } from '../network/queries/application'
import { GetApplication } from '@/interfaces/get_application'
import { PostApplication } from '@/interfaces/post_application'
import { postNewApplicationAuthenticated } from '../network/mutations/postApplicationAuthenticated'
import { useState } from 'react'
import { ApplicationSavingDialog } from './components/ApplicationSavingDialog'
import { CreateApplicationAnswerText } from '@/interfaces/application_answer_text'
import { CreateApplicationAnswerMultiSelect } from '@/interfaces/application_answer_multi_select'
import { InfoBanner } from './components/InfoBanner'

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
      answers_text: answersText,
      answers_multi_select: answersMultiSelect,
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

  const { application_phase } = applicationForm

  let student: Student = {
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    email: user?.email ?? '',
    has_university_account: true,
  }
  if (
    (application.status === 'applied' || application.status === 'not_applied') &&
    application.student
  ) {
    student = application.student
    // enforcing that student has university account
    student.has_university_account = true
  }

  return (
    <AuthenticatedPageWrapper withLoginButton={false}>
      <div className='max-w-4xl mx-auto space-y-6'>
        <ApplicationHeader applicationPhase={application_phase} onBackClick={handleBack} />
        <InfoBanner status={application.status} />
        <ApplicationFormView
          questionsText={applicationForm.questions_text}
          questionsMultiSelect={applicationForm.questions_multi_select}
          initialAnswersMultiSelect={application.answers_multi_select}
          initialAnswersText={application.answers_text}
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
