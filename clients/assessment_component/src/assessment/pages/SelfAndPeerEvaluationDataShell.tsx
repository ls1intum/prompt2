import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'

import { useCourseStore, CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ErrorPage,
  LoadingPage,
} from '@tumaet/prompt-ui-components'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'

import { useCoursePhaseConfigStore } from '../zustand/useCoursePhaseConfigStore'
import { useTeamStore } from '../zustand/useTeamStore'
import { useMyParticipationStore } from '../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../zustand/usePeerEvaluationCategoryStore'
import { useEvaluationStore } from '../zustand/useEvaluationStore'

import { useGetCoursePhaseConfig } from './hooks/useGetCoursePhaseConfig'
import { useGetAllTeams } from './hooks/useGetAllTeams'
import { useGetSelfEvaluationCategoriesWithCompetencies } from './hooks/useGetSelfEvaluationCategoriesWithCompetencies'
import { useGetPeerEvaluationCategoriesWithCompetencies } from './hooks/useGetPeerEvaluationCategoriesWithCompetencies'
import { useGetMySelfEvaluationCompletion } from './hooks/useGetMySelfEvaluationCompletion'
import { useGetMyPeerEvaluationCompletions } from './hooks/useGetMyPeerEvaluationCompletions'
import { useGetMyEvaluations } from './hooks/useGetMyEvaluations'

interface SelfAndPeerAssessmentDataShellProps {
  children: React.ReactNode
}

export const SelfAndPeerEvaluationDataShell = ({
  children,
}: SelfAndPeerAssessmentDataShellProps) => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  const { setCoursePhaseConfig } = useCoursePhaseConfigStore()
  const { setSelfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { setPeerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { setTeams } = useTeamStore()
  const { setMyParticipation } = useMyParticipationStore()
  const {
    setSelfEvaluationCompletion,
    setPeerEvaluationCompletions,
    setSelfEvaluations,
    setPeerEvaluations,
  } = useEvaluationStore()

  const {
    data: coursePhaseConfig,
    isPending: isCoursePhaseConfigPending,
    isError: isCoursePhaseConfigError,
    refetch: refetchCoursePhaseConfig,
  } = useGetCoursePhaseConfig()

  const {
    data: selfEvaluationCategories,
    isPending: isSelfEvaluationCategoriesPending,
    isError: isSelfEvaluationCategoriesError,
    refetch: refetchSelfEvaluationCategories,
  } = useGetSelfEvaluationCategoriesWithCompetencies()

  const {
    data: peerEvaluationCategories,
    isPending: isPeerEvaluationCategoriesPending,
    isError: isPeerEvaluationCategoriesError,
    refetch: refetchPeerEvaluationCategories,
  } = useGetPeerEvaluationCategoriesWithCompetencies()

  const {
    data: teams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useGetAllTeams()

  const {
    data: participation,
    isPending: isParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationWithStudent>({
    queryKey: ['course_phase_participation', phaseId],
    queryFn: () => getOwnCoursePhaseParticipation(phaseId ?? ''),
    enabled: isStudent,
  })

  const {
    data: selfEvaluationCompletion,
    isPending: isCompletionPending,
    isError: isCompletionError,
    refetch: refetchCompletion,
  } = useGetMySelfEvaluationCompletion({ enabled: isStudent })

  const {
    data: peerEvaluationCompletions,
    isPending: isPeerEvaluationsPending,
    isError: isPeerEvaluationsError,
    refetch: refetchPeerEvaluations,
  } = useGetMyPeerEvaluationCompletions({ enabled: isStudent })

  const {
    selfEvaluations: selfEvaluations,
    peerEvaluations: peerEvaluations,
    isPending: isMyEvaluationsPending,
    isError: isMyEvaluationsError,
    refetch: refetchMyEvaluations,
  } = useGetMyEvaluations({ enabled: isStudent })

  const isError =
    isSelfEvaluationCategoriesError ||
    isPeerEvaluationCategoriesError ||
    isTeamsError ||
    isCoursePhaseConfigError ||
    (isStudent && isParticipationsError) ||
    (isStudent && isCompletionError) ||
    (isStudent && isPeerEvaluationsError) ||
    (isStudent && isMyEvaluationsError)
  const isPending =
    isSelfEvaluationCategoriesPending ||
    isPeerEvaluationCategoriesPending ||
    isTeamsPending ||
    isCoursePhaseConfigPending ||
    (isStudent && isParticipationsPending) ||
    (isStudent && isCompletionPending) ||
    (isStudent && isPeerEvaluationsPending) ||
    (isStudent && isMyEvaluationsPending)
  const refetch = () => {
    refetchSelfEvaluationCategories()
    refetchPeerEvaluationCategories()
    refetchTeams()
    refetchCoursePhaseConfig()
    if (isStudent) {
      refetchCoursePhaseParticipations()
      refetchCompletion()
      refetchPeerEvaluations()
      refetchMyEvaluations()
    }
  }

  useEffect(() => {
    if (coursePhaseConfig) {
      setCoursePhaseConfig(coursePhaseConfig)
    }
  }, [coursePhaseConfig, setCoursePhaseConfig])

  useEffect(() => {
    if (teams) {
      setTeams(teams)
    }
  }, [teams, setTeams])

  useEffect(() => {
    if (participation && isStudent) {
      setMyParticipation(participation)
    }
  }, [participation, setMyParticipation, isStudent])

  useEffect(() => {
    if (selfEvaluationCategories) {
      setSelfEvaluationCategories(selfEvaluationCategories)
    }
  }, [selfEvaluationCategories, setSelfEvaluationCategories])

  useEffect(() => {
    if (peerEvaluationCategories) {
      setPeerEvaluationCategories(peerEvaluationCategories)
    }
  }, [peerEvaluationCategories, setPeerEvaluationCategories])

  useEffect(() => {
    if (selfEvaluationCompletion && isStudent) {
      setSelfEvaluationCompletion(selfEvaluationCompletion)
    }
  }, [selfEvaluationCompletion, setSelfEvaluationCompletion, isStudent])

  useEffect(() => {
    if (peerEvaluationCompletions && isStudent) {
      setPeerEvaluationCompletions(peerEvaluationCompletions)
    }
  }, [peerEvaluationCompletions, setPeerEvaluationCompletions, isStudent])

  useEffect(() => {
    if (selfEvaluations && isStudent) {
      setSelfEvaluations(selfEvaluations)
    }
  }, [selfEvaluations, setSelfEvaluations, isStudent])

  useEffect(() => {
    if (peerEvaluations && isStudent) {
      setPeerEvaluations(peerEvaluations)
    }
  }, [peerEvaluations, setPeerEvaluations, isStudent])

  if (isError)
    return (
      <ErrorPage
        onRetry={refetch}
        description='Could not fetch self and peer evaluation categories'
      />
    )
  if (isPending) return <LoadingPage />

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>Your are not a student of this course.</AlertTitle>
          <AlertDescription>
            The following components are disabled because you are not a student of this course.
            Evaluations for self and peer assessments are currently only available for students. The
            platform will show a random team regardless, to demonstrate the functionality.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}
