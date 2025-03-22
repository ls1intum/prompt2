import { Loader2 } from 'lucide-react'

import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { ErrorPage } from '@/components/ErrorPage'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'

import { useGetParticipationsWithProfiles } from './hooks/useGetParticipationsWithProfiles'

export const ResultsOverviewPage = (): JSX.Element => {
  const john: CoursePhaseParticipationWithStudent = {
    coursePhaseID: '1',
    courseParticipationID: '1',
    passStatus: PassStatus.FAILED,
    restrictedData: {},
    studentReadableData: {},
    prevData: {
      challenge_passed: false,
      attempts: 2,
    },
    student: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      hasUniversityAccount: false,
    },
  }
  const mike: CoursePhaseParticipationWithStudent = {
    coursePhaseID: '1',
    courseParticipationID: '1',
    passStatus: PassStatus.PASSED,
    restrictedData: {},
    studentReadableData: {},
    prevData: {
      challenge_passed: true,
      attempts: 3,
    },
    student: {
      id: '1',
      firstName: 'Mike',
      lastName: 'Master',
      email: '',
      hasUniversityAccount: false,
    },
  }
  const exampleParticipants = [john, mike]

  // get
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  const {
    data: developerProfiles,
    isPending: isDeveloperProfilesPending,
    isError: isDeveloperProfileError,
    refetch: refetchDeveloperProfiles,
  } = useQuery<DeveloperProfile[]>({
    queryKey: ['developerProfiles', phaseId],
    queryFn: () => getAllDeveloperProfiles(phaseId ?? ''),
  })

  const isError = isParticipationsError || isDeveloperProfileError
  const isPending = isCoursePhaseParticipationsPending || isDeveloperProfilesPending

  const handleRefresh = () => {
    refetchCoursePhaseParticipations()
    refetchDeveloperProfiles()
  }

  // Match participants with their developer profiles
  const participantsWithProfiles = useGetParticipationsWithProfiles(
    coursePhaseParticipations?.participations || [],
    developerProfiles || [],
  )

  // TODO Add this sorting function before the return statement
  // const sortedParticipants = useGetSortedParticipations(sortConfig, participantsWithProfiles)

  // TODO Filter participants based on the current filter settings
  // const filteredParticipants = useGetFilteredParticipations(sortedParticipants, filters)

  if (isError) {
    return <ErrorPage onRetry={handleRefresh} />
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div>
      {isParticipationsError ? (
        <ErrorPage onRetry={refetchCoursePhaseParticipations} />
      ) : isCoursePhaseParticipationsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <CoursePhaseParticipationsTablePage
          participants={exampleParticipants}
          prevDataKeys={['challenge_passed', 'attempts']}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
        />
      )}
    </div>
  )
}
