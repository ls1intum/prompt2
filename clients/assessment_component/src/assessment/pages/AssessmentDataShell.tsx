import { useEffect } from 'react'

import { ErrorPage, LoadingPage } from '@tumaet/prompt-ui-components'

import { useGetCoursePhaseParticipations } from './hooks/useGetCoursePhaseParticipations'
import { useGetAllTeams } from './hooks/useGetAllTeams'
import { useGetAllCategoriesWithCompetencies } from './hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useGetCoursePhaseConfig } from './hooks/useGetCoursePhaseConfig'
import { useGetSelfEvaluationCategoriesWithCompetencies } from './hooks/useGetSelfEvaluationCategoriesWithCompetencies'
import { useGetPeerEvaluationCategoriesWithCompetencies } from './hooks/useGetPeerEvaluationCategoriesWithCompetencies'
import { useGetTutorEvaluationCategoriesWithCompetencies } from './hooks/useGetTutorEvaluationCategoriesWithCompetencies' // New hook

import { useParticipationStore } from '../zustand/useParticipationStore'
import { useTeamStore } from '../zustand/useTeamStore'
import { useCategoryStore } from '../zustand/useCategoryStore'
import { useScoreLevelStore } from '../zustand/useScoreLevelStore'
import { useCoursePhaseConfigStore } from '../zustand/useCoursePhaseConfigStore'
import { useSelfEvaluationCategoryStore } from '../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../zustand/usePeerEvaluationCategoryStore'
import { useTutorEvaluationCategoryStore } from '../zustand/useTutorEvaluationCategoryStore' // New Zustand store

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
  const { setTutorEvaluationCategories } = useTutorEvaluationCategoryStore() // New setter

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

  const {
    data: tutorEvaluationCategories, // New data
    isPending: isTutorEvaluationCategoriesPending, // New pending state
    isError: isTutorEvaluationCategoriesError, // New error state
    refetch: refetchTutorEvaluationCategories, // New refetch function
  } = useGetTutorEvaluationCategoriesWithCompetencies()

  const isError =
    isParticipationsError ||
    isTeamsError ||
    isCategoriesError ||
    isScoreLevelsError ||
    isCoursePhaseConfigError ||
    isSelfEvaluationCategoriesError ||
    isPeerEvaluationCategoriesError ||
    isTutorEvaluationCategoriesError // Include new error state
  const isPending =
    isCoursePhaseParticipationsPending ||
    isTeamsPending ||
    isCategoriesPending ||
    isScoreLevelsPending ||
    isCoursePhaseConfigPending ||
    isSelfEvaluationCategoriesPending ||
    isPeerEvaluationCategoriesPending ||
    isTutorEvaluationCategoriesPending // Include new pending state

  const refetch = () => {
    refetchTeams()
    refetchCoursePhaseParticipations()
    refetchCategories()
    refetchScoreLevels()
    refetchCoursePhaseConfig()
    refetchSelfEvaluationCategories()
    refetchPeerEvaluationCategories()
    refetchTutorEvaluationCategories() // Include new refetch
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

  useEffect(() => {
    if (tutorEvaluationCategories) {
      setTutorEvaluationCategories(tutorEvaluationCategories) // New effect
    }
  }, [tutorEvaluationCategories, setTutorEvaluationCategories])

  return (
    <>{isError ? <ErrorPage onRetry={refetch} /> : isPending ? <LoadingPage /> : <>{children}</>}</>
  )
}
