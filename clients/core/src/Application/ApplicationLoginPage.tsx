import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import translations from '@/lib/translations.json'
import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'
import { ApplicationHeader } from './components/ApplicationHeader'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

export const ApplicationLoginPage = (): JSX.Element => {
  const path = window.location.pathname
  const { phaseId } = useParams<{ phaseId: string }>()
  const navigate = useNavigate()

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
        <Card>
          <CardHeader>
            <CardTitle>Please log in to continue:</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {!externalStudentsAllowed && (
              <p className='text-yellow-600 bg-yellow-50 p-3 rounded-md'>
                This course is only open for {translations.university.name} students. If you cannot
                log in, please reach out to the instructor of the course.
              </p>
            )}
            <div className='space-y-4'>
              <p>
                Are you a {translations.university.name} student? Then please log in using your{' '}
                {translations.university['login-name']}.
              </p>
              <Button
                className='w-full bg-[#0065BD] hover:bg-[#005299] text-white'
                size='lg'
                onClick={() => navigate(path + '/authenticated')}
              >
                <GraduationCap className='mr-2 h-5 w-5' />
                Log in with {translations.university['login-name']}
              </Button>
            </div>
            {externalStudentsAllowed && (
              <>
                <Separator className='my-4' />
                <div className='space-y-4'>
                  <p>Are you an external student?</p>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => navigate(path + '/extern')}
                  >
                    Continue without a {translations.university.name}-Account
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </NonAuthenticatedPageWrapper>
  )
}
