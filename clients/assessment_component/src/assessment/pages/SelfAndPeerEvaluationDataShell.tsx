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

import { useTeamStore } from '../zustand/useTeamStore'
import { useMyParticipationStore } from '../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../zustand/usePeerEvaluationCategoryStore'

import { useGetAllTeams } from './hooks/useGetAllTeams'
import { useGetSelfEvaluationCategoriesWithCompetencies } from './hooks/useGetSelfEvaluationCategoriesWithCompetencies'
import { useGetPeerEvaluationCategoriesWithCompetencies } from './hooks/useGetPeerEvaluationCategoriesWithCompetencies'

interface SelfAndPeerAssessmentDataShellProps {
  children: React.ReactNode
}

export const SelfAndPeerEvaluationDataShell = ({
  children,
}: SelfAndPeerAssessmentDataShellProps) => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  const { setSelfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { setPeerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { setTeams } = useTeamStore()
  const { setMyParticipation } = useMyParticipationStore()

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

  const isError =
    isSelfEvaluationCategoriesError ||
    isPeerEvaluationCategoriesError ||
    isTeamsError ||
    isParticipationsError
  const isPending =
    isSelfEvaluationCategoriesPending ||
    isPeerEvaluationCategoriesPending ||
    isTeamsPending ||
    isParticipationsPending
  const refetch = () => {
    refetchSelfEvaluationCategories()
    refetchPeerEvaluationCategories()
    refetchTeams()
    refetchCoursePhaseParticipations()
  }

  useEffect(() => {
    if (teams) {
      setTeams(teams)
    }
  }, [teams, setTeams])

  useEffect(() => {
    if (participation) {
      setMyParticipation(participation)
    }
  }, [participation, setMyParticipation])

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
            Evaluations for self and peer assessments are currently only available for students.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}
