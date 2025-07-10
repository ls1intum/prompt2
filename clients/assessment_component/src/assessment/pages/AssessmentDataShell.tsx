import { useEffect } from 'react'

import { ErrorPage, LoadingPage } from '@tumaet/prompt-ui-components'

import { useGetCoursePhaseParticipations } from './hooks/useGetCoursePhaseParticipations'
import { useGetAllTeams } from './hooks/useGetAllTeams'
import { useGetAllCategoriesWithCompetencies } from './hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useGetCoursePhaseConfig } from './hooks/useGetCoursePhaseConfig'
import { useGetSelfEvaluationCategoriesWithCompetencies } from './hooks/useGetSelfEvaluationCategoriesWithCompetencies'
import { useGetPeerEvaluationCategoriesWithCompetencies } from './hooks/useGetPeerEvaluationCategoriesWithCompetencies'

import { useParticipationStore } from '../zustand/useParticipationStore'
import { useTeamStore } from '../zustand/useTeamStore'
import { useCategoryStore } from '../zustand/useCategoryStore'
import { useScoreLevelStore } from '../zustand/useScoreLevelStore'
import { useCoursePhaseConfigStore } from '../zustand/useCoursePhaseConfigStore'
import { useSelfEvaluationCategoryStore } from '../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../zustand/usePeerEvaluationCategoryStore'

interface AssessmentDataShellProps {
  children: React.ReactNode
}

export const AssessmentDataShell = ({ children }: AssessmentDataShellProps) => {
  const { setParticipations } = useParticipationStore()
  const { setTeams } = useTeamStore()
  const { setCategories } = useCategoryStore()
  const { setScoreLevels } = useScoreLevelStore()
  const { setCoursePhaseConfig } = useCoursePhaseConfigStore()
  const { setSelfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { setPeerEvaluationCategories } = usePeerEvaluationCategoryStore()

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

  const isError =
    isParticipationsError ||
    isTeamsError ||
    isCategoriesError ||
    isScoreLevelsError ||
    isCoursePhaseConfigError ||
    isSelfEvaluationCategoriesError ||
    isPeerEvaluationCategoriesError
  const isPending =
    isCoursePhaseParticipationsPending ||
    isTeamsPending ||
    isCategoriesPending ||
    isScoreLevelsPending ||
    isCoursePhaseConfigPending ||
    isSelfEvaluationCategoriesPending ||
    isPeerEvaluationCategoriesPending

  const refetch = () => {
    refetchTeams()
    refetchCoursePhaseParticipations()
    refetchCategories()
    refetchScoreLevels()
    refetchCoursePhaseConfig()
    refetchSelfEvaluationCategories()
    refetchPeerEvaluationCategories()
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
    if (coursePhaseConfig) {
      setCoursePhaseConfig(coursePhaseConfig)
    }
  }, [coursePhaseConfig, setCoursePhaseConfig])

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

  return (
    <>{isError ? <ErrorPage onRetry={refetch} /> : isPending ? <LoadingPage /> : <>{children}</>}</>
  )
}
