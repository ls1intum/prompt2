import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { ErrorPage } from '@tumaet/prompt-ui-components'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

import { useGetAllCategoriesWithCompetencies } from './hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'

import { useParticipationStore } from '../zustand/useParticipationStore'
import { useCategoryStore } from '../zustand/useCategoryStore'
import { useScoreLevelStore } from '../zustand/useScoreLevelStore'

interface AssessmentDataShellProps {
  children: React.ReactNode
}

export const AssessmentDataShell = ({ children }: AssessmentDataShellProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { setParticipations } = useParticipationStore()
  const { setCategories } = useCategoryStore()
  const { setScoreLevels } = useScoreLevelStore()

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

  const isError = isParticipationsError || isCategoriesError || isScoreLevelsError
  const isPending =
    isCoursePhaseParticipationsPending || isCategoriesPending || isScoreLevelsPending

  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchCategories()
    refetchScoreLevels()
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

  return (
    <>
      {isError ? (
        <ErrorPage onRetry={refetch} />
      ) : isPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  )
}
