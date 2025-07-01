import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { ErrorPage, LoadingPage } from '@tumaet/prompt-ui-components'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

import { useGetAllCategoriesWithCompetencies } from './hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useGetDeadline } from './hooks/useGetDeadline'

import { useParticipationStore } from '../zustand/useParticipationStore'
import { useCategoryStore } from '../zustand/useCategoryStore'
import { useScoreLevelStore } from '../zustand/useScoreLevelStore'
import { useDeadlineStore } from '../zustand/useDeadlineStore'

interface AssessmentDataShellProps {
  children: React.ReactNode
}

export const AssessmentDataShell = ({ children }: AssessmentDataShellProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { setParticipations } = useParticipationStore()
  const { setCategories } = useCategoryStore()
  const { setScoreLevels } = useScoreLevelStore()
  const { setDeadline } = useDeadlineStore()

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
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetAllCategoriesWithCompetencies()

  const {
    data: scoreLevels,
    isPending: isScoreLevelsPending,
    isError: isScoreLevelsError,
    refetch: refetchScoreLevels,
  } = useGetAllScoreLevels()

  const {
    data: deadline,
    isPending: isDeadlinePending,
    isError: isDeadlineError,
    refetch: refetchDeadline,
  } = useGetDeadline()

  const isError =
    isParticipationsError || isCategoriesError || isScoreLevelsError || isDeadlineError
  const isPending =
    isCoursePhaseParticipationsPending ||
    isCategoriesPending ||
    isScoreLevelsPending ||
    isDeadlinePending

  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchCategories()
    refetchScoreLevels()
    refetchDeadline()
  }

  useEffect(() => {
    if (coursePhaseParticipations) {
      setParticipations(coursePhaseParticipations.participations)
    }
  }, [coursePhaseParticipations, setParticipations])

  useEffect(() => {
    if (categories) {
      setCategories(categories)
    }
  }, [categories, setCategories])

  useEffect(() => {
    if (scoreLevels) {
      setScoreLevels(scoreLevels)
    }
  }, [scoreLevels, setScoreLevels])

  useEffect(() => {
    if (deadline && deadline != null) {
      setDeadline(deadline)
    }
  }, [deadline, setDeadline])

  return (
    <>{isError ? <ErrorPage onRetry={refetch} /> : isPending ? <LoadingPage /> : <>{children}</>}</>
  )
}
