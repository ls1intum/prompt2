import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ApplicationFormWithDetails } from '@/interfaces/application_form_with_details'
import { getApplicationFormWithDetails } from '../network/queries/applicationFormWithDetails'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import translations from '@/lib/translations.json'

export const ApplicationForm = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

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
      <div>
        <Loader2 />
      </div>
    )
  }

  if (isError || !applicationForm) {
    let errorMessage = 'An error occurred while fetching the application form.'

    // Check for specific error types
    if (error.message.includes('404')) {
      errorMessage = 'The requested application phase cannot be found or may have already passed.'
    }
    console.error(error)

    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            Error{error.message.includes('404') ? ': Not Found' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{errorMessage}</p>
        </CardContent>
      </Card>
    )
  }

  const { application_phase } = applicationForm
  const externalStudentsAllowed = application_phase.externalStudentsAllowed

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle>{application_phase.courseName}</CardTitle>
            <CardDescription>Application Form</CardDescription>
          </div>
          <Badge variant='outline'>{application_phase.courseType}</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <strong>ECTS:</strong> {application_phase.ects}
          </div>
        </div>

        <div className='space-y-4'>
          <Button className='w-full'>
            Log-In with your {translations.university['login-name']}
          </Button>

          {externalStudentsAllowed && (
            <div className='text-center'>
              <a href='/external-application' className='text-primary hover:underline'>
                Not a {translations.university.name} Student? Continue as an external student.
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
