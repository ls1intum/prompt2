import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { DeveloperProfile } from 'src/introCourse/interfaces/DeveloperProfile'
import { Tutor } from 'src/introCourse/interfaces/Tutor'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'
import { getAllTutors } from '../../network/queries/getAllTutors'
import { useGetParticipationsWithProfiles } from '../DeveloperProfilesLecturer/hooks/useGetParticipationsWithProfiles'
import { useState } from 'react'

export const SeatAssignmentPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [seats, setSeats] = useState<Seat[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [tutors, setTutors] = useState<Tutor[]>([])


  // Data fetching
  const {
    data: tutors,
    isPending: isPendingTutors,
    isError: isTutorsLoadingError,
    refetch: refetchTutors,
  } = useQuery<Tutor[]>({
    queryKey: ['tutors', phaseId],
    queryFn: () => getAllTutors(phaseId ?? ''),
  })

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

  const isPending =
    isCoursePhaseParticipationsPending || isDeveloperProfilesPending || isPendingTutors
  const isError = isParticipationsError || isDeveloperProfileError || isTutorsLoadingError

  const developerWithProfiles = useGetParticipationsWithProfiles(
    coursePhaseParticipations?.participations || [],
    developerProfiles || [],
  )

  if (isPending) {
    return (
      <div className='flex justify-center items-center flex-grow'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchCoursePhaseParticipations()
          refetchDeveloperProfiles()
          refetchTutors()
        }}
      />
    )
  }

  return (
    <div>
      <ManagementPageHeader>Seat Assignment</ManagementPageHeader>
    </div>
  )
}
