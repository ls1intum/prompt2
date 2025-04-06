import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { Tutor } from '../../interfaces/Tutor'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'
import { getAllTutors } from '../../network/queries/getAllTutors'
import { getSeatPlan } from '../../network/queries/getSeatPlan'
import { Seat } from '../../interfaces/Seat'
import { SeatUploader } from './components/SeatUploader/SeatUploader'
import { SeatMacAssigner } from './components/SeatMacAssigner'
import { SeatTutorAssigner } from './components/SeatTutorAssigner/SeatTutorAssigner'
import { SeatStudentAssigner } from './components/SeatStudentAssigner/SeatStudentAssigner'
import { useGetParticipationsWithDevProfile } from './hooks/useGetParticipationWithDevProfile'

export const SeatAssignmentPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

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

  const {
    data: seats,
    isPending: isSeatPlanLoading,
    isError: isSeatPlanError,
    refetch: refetchSeatPlan,
  } = useQuery<Seat[]>({
    queryKey: ['seatPlan', phaseId],
    queryFn: () => getSeatPlan(phaseId ?? ''),
  })

  const isPending =
    isCoursePhaseParticipationsPending ||
    isDeveloperProfilesPending ||
    isPendingTutors ||
    isSeatPlanLoading
  const isError =
    isParticipationsError || isDeveloperProfileError || isTutorsLoadingError || isSeatPlanError

  const developerWithProfiles = useGetParticipationsWithDevProfile(
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
          refetchSeatPlan()
        }}
      />
    )
  }

  return (
    <div className='space-y-6'>
      <ManagementPageHeader>Seat Assignment</ManagementPageHeader>
      <SeatUploader existingSeats={seats || []} />
      {seats.length > 0 && <SeatMacAssigner existingSeats={seats} />}
      {seats.length > 0 && (
        <SeatTutorAssigner
          seats={seats}
          tutors={tutors || []}
          numberOfStudents={developerWithProfiles.length}
        />
      )}
      {seats.length > 0 && (
        <SeatStudentAssigner
          seats={seats}
          developerWithProfiles={developerWithProfiles}
          tutors={tutors}
        />
      )}
    </div>
  )
}
