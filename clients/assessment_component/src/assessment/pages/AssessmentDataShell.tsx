import { useEffect } from 'react'

import { ErrorPage, LoadingPage } from '@tumaet/prompt-ui-components'

import { useGetCoursePhaseParticipations } from './hooks/useGetCoursePhaseParticipations'
import { useGetAllTeams } from './hooks/useGetAllTeams'
import { useGetAllCategoriesWithCompetencies } from './hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useGetDeadline } from './hooks/useGetDeadline'

import { useParticipationStore } from '../zustand/useParticipationStore'
import { useTeamStore } from '../zustand/useTeamStore'
import { useCategoryStore } from '../zustand/useCategoryStore'
import { useScoreLevelStore } from '../zustand/useScoreLevelStore'
import { useDeadlineStore } from '../zustand/useDeadlineStore'

interface AssessmentDataShellProps {
  children: React.ReactNode
}

export const AssessmentDataShell = ({ children }: AssessmentDataShellProps) => {
  const { setParticipations } = useParticipationStore()
  const { setTeams } = useTeamStore()
  const { setCategories } = useCategoryStore()
  const { setScoreLevels } = useScoreLevelStore()
  const { setDeadline } = useDeadlineStore()

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useGetCoursePhaseParticipations()

  const {
    data: teams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useGetAllTeams()

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
    isParticipationsError ||
    isTeamsError ||
    isCategoriesError ||
    isScoreLevelsError ||
    isDeadlineError
  const isPending =
    isCoursePhaseParticipationsPending ||
    isTeamsPending ||
    isCategoriesPending ||
    isScoreLevelsPending ||
    isDeadlinePending

  const refetch = () => {
    refetchTeams()
    refetchCoursePhaseParticipations()
    refetchCategories()
    refetchScoreLevels()
    refetchDeadline()
  }

  useEffect(() => {
    if (coursePhaseParticipations) {
      setParticipations(coursePhaseParticipations)
    }
  }, [coursePhaseParticipations, setParticipations])

  useEffect(() => {
    if (teams) {
      setTeams(teams)
    }
  }, [teams, setTeams])

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
