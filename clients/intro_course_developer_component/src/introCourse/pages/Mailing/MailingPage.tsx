import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseMailing } from '@/components/pages/Mailing/CoursePhaseMailing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getCoursePhase } from '@/network/queries/getCoursePhase'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export const MailingPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const location = window.location.pathname

  const {
    data: coursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch,
  } = useQuery<CoursePhaseWithMetaData>({
    queryKey: ['course_phase', phaseId],
    queryFn: () => getCoursePhase(phaseId ?? ''),
  })

  return (
    <>
      {isCoursePhaseError ? (
        <ErrorPage onRetry={refetch} />
      ) : isCoursePhasePending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <>
          <div>
            <ManagementPageHeader>Mailing</ManagementPageHeader>

            <Alert className='mb-6'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Important Reminder</AlertTitle>
              <AlertDescription className='flex flex-col gap-2'>
                <p>
                  Before sending any emails, please ensure all participants are set to the correct
                  status (passed / failed).
                </p>
                <div>
                  <Button variant='outline' asChild>
                    <Link to={location.replace('/mailing', '/participants')}>
                      Go To Course Phase Participants
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <CoursePhaseMailing coursePhase={coursePhase} />
          </div>
        </>
      )}
    </>
  )
}
