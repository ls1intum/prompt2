import { AlertCircle, Loader2 } from 'lucide-react'
import { CourseCard } from './components/CourseCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useQuery } from '@tanstack/react-query'
import { OpenApplicationDetails } from '@/interfaces/open_application_details'
import { getAllOpenApplications } from '../network/queries/openApplications'
import { NonAuthenticatedPageWrapper } from '../components/NonAuthenticatedPageWrapper'
import { useState } from 'react'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { Content } from '@tiptap/react'
import { TooltipProvider } from '@/components/ui/tooltip'

export function LandingPage(): JSX.Element {
  const {
    data: openApplications,
    isPending,
    isError,
  } = useQuery<OpenApplicationDetails[]>({
    queryKey: ['open_applications'],
    queryFn: () => getAllOpenApplications(),
  })
  const [value, setValue] = useState<Content>('')

  return (
    <NonAuthenticatedPageWrapper>
      <section className='text-center mb-16'>
        <h2 className='text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl mb-4'>
          Course Application Portal
        </h2>
        <p className='text-xl text-gray-600 max-w-4xl mx-auto mb-8'>
          Welcome to the TUM Research Group for Applied Education Technologies&apos; official
          platform for course and seminar applications.
        </p>
      </section>
      <TooltipProvider>
        <MinimalTiptapEditor
          value={value}
          onChange={(answer) => setValue(answer)}
          className='w-full'
          editorContentClassName='minimal-tiptap-editor'
          output='html'
          placeholder='Type your description here...'
          autofocus={true}
          editable={true}
          editorClassName='focus:outline-none'
        />
      </TooltipProvider>

      <section className='mb-16'>
        <h3 className='text-2xl font-semibold text-gray-800 mb-6'>Available Courses</h3>
        {isPending ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : isError ? (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              An error occurred while fetching courses. Please try again later.
            </AlertDescription>
          </Alert>
        ) : openApplications && openApplications.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {openApplications.map((courseDetails) => (
              <CourseCard key={courseDetails.id} courseDetails={courseDetails} />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>No Open Applications</AlertTitle>
            <AlertDescription>
              No applications are currently open. Please check back later.
            </AlertDescription>
          </Alert>
        )}
      </section>
    </NonAuthenticatedPageWrapper>
  )
}
