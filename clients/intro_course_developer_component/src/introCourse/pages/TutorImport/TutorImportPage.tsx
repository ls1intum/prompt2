import { KeycloakGroupCreation } from './components/KeycloakGroupCreation'
import { TutorImportDialog } from './components/TutorImportDialog'
import { TutorTable } from './components/TutorTable'
import { useGetCoursePhase } from '@/hooks/useGetCoursePhase'
import { Loader2 } from 'lucide-react'
import { ManagementPageHeader, ErrorPage, Separator } from '@tumaet/prompt-ui-components'

export const TutorImportPage = () => {
  const {
    data: coursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch: refetchCoursePhase,
  } = useGetCoursePhase()

  if (isCoursePhasePending) {
    return (
      <div className='flex justify-center items-center flex-grow'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isCoursePhaseError) {
    return <ErrorPage onRetry={refetchCoursePhase} />
  }

  const groupExists = !!coursePhase?.restrictedData?.keycloakGroup

  return (
    <div className='space-y-8'>
      <ManagementPageHeader>Tutor Import</ManagementPageHeader>

      {/* Keycloak Group Section */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Keycloak Group Status</h2>
        <KeycloakGroupCreation coursePhase={coursePhase} />
      </div>

      <Separator className='my-6' />

      {groupExists ? (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>Imported Tutors</h2>
            <TutorImportDialog />
          </div>
          <TutorTable />
        </div>
      ) : (
        <div> Please create a Keycloak group first before adding Tutors</div>
      )}
    </div>
  )
}
