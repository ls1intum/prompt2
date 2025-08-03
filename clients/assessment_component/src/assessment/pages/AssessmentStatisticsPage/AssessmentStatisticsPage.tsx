import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'

import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { AssessmentCompletion } from '../../interfaces/assessmentCompletion'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { getAllAssessmentCompletionsInPhase } from '../../network/queries/getAllAssessmentCompletionsInPhase'

import { useGetAllAssessments } from '../hooks/useGetAllAssessments'

import { useGetParticipationsWithAssessment } from '../components/diagrams/hooks/useGetParticipationsWithAssessment'

import { GradeDistributionDiagram } from '../components/diagrams/GradeDistributionDiagram'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { ScoreLevelDistributionDiagram } from '../components/diagrams/ScoreLevelDistributionDiagram'
import { GenderDiagram } from '../components/diagrams/GenderDiagram'
import { AuthorDiagram } from '../components/diagrams/AuthorDiagram'
import { CategoryDiagram } from '../components/diagrams/CategoryDiagram'
import { NationalityDiagram } from '../components/diagrams/NationalityDiagram'

import { FilterMenu, StatisticsFilter } from './components/FilterMenu'
import { FilterBadges } from './components/FilterBadges'

export const AssessmentStatisticsPage = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [filters, setFilters] = useState<StatisticsFilter>({})

  const { categories } = useCategoryStore()
  const { participations } = useParticipationStore()
  const { scoreLevels } = useScoreLevelStore()

  const {
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetAllAssessments()

  const {
    data: assessmentCompletions,
    isPending: isAssessmentCompletionsPending,
    isError: isAssessmentCompletionsError,
    refetch: refetchAssessmentCompletions,
  } = useQuery<AssessmentCompletion[]>({
    queryKey: ['assessmentCompletions', phaseId],
    queryFn: () => getAllAssessmentCompletionsInPhase(phaseId ?? ''),
  })

  const participationsWithAssessments = useGetParticipationsWithAssessment(
    participations || [],
    scoreLevels || [],
    assessmentCompletions || [],
    assessments || [],
  )

  const filteredData = useMemo(() => {
    if (!participations || !assessmentCompletions || !participationsWithAssessments) {
      return {
        participations: [],
        completions: [],
        grades: [],
        participationsWithAssessments: [],
      }
    }

    const participationIDsWithGrades = new Set(
      participationsWithAssessments
        .filter((c) => c.assessmentCompletion?.gradeSuggestion !== undefined)
        .map((c) => c.participation.courseParticipationID),
    )

    let filteredParticipations = participations
    let filteredCompletions = assessmentCompletions
    let filteredParticipationsWithAssessments = participationsWithAssessments

    // Apply grade filters
    if (filters.hasGrade) {
      // Only include participations that have grades
      filteredParticipations = filteredParticipations.filter((p) =>
        participationIDsWithGrades.has(p.courseParticipationID),
      )
      filteredCompletions = filteredCompletions.filter((c) => c.gradeSuggestion !== undefined)
      filteredParticipationsWithAssessments = filteredParticipationsWithAssessments.filter((p) =>
        participationIDsWithGrades.has(p.participation.courseParticipationID),
      )
    } else if (filters.noGrade) {
      // Only include participations that don't have grades
      filteredParticipations = filteredParticipations.filter(
        (p) => !participationIDsWithGrades.has(p.courseParticipationID),
      )
      filteredCompletions = filteredCompletions.filter((c) => c.gradeSuggestion === undefined)
      filteredParticipationsWithAssessments = filteredParticipationsWithAssessments.filter(
        (p) => !participationIDsWithGrades.has(p.participation.courseParticipationID),
      )
    }

    // Apply gender filters
    if (filters.genders && filters.genders.length > 0) {
      filteredParticipations = filteredParticipations.filter(
        (p) => p.student.gender && filters.genders!.includes(p.student.gender),
      )
      filteredParticipationsWithAssessments = filteredParticipationsWithAssessments.filter(
        (p) =>
          p.participation.student.gender &&
          filters.genders!.includes(p.participation.student.gender),
      )
      // Filter completions to match filtered participations
      const filteredParticipationIds = new Set(
        filteredParticipations.map((p) => p.courseParticipationID),
      )
      filteredCompletions = filteredCompletions.filter((c) =>
        filteredParticipationIds.has(c.courseParticipationID),
      )
    }

    // Apply semester filters
    if (filters.semester && (filters.semester.min || filters.semester.max)) {
      const { min, max } = filters.semester

      filteredParticipations = filteredParticipations.filter((p) => {
        const semester = p.student.currentSemester || 0
        const meetsMin = !min || semester >= min
        const meetsMax = !max || semester <= max
        return meetsMin && meetsMax
      })

      filteredParticipationsWithAssessments = filteredParticipationsWithAssessments.filter((p) => {
        const semester = p.participation.student.currentSemester || 0
        const meetsMin = !min || semester >= min
        const meetsMax = !max || semester <= max
        return meetsMin && meetsMax
      })

      // Filter completions to match filtered participations
      const filteredParticipationIds = new Set(
        filteredParticipations.map((p) => p.courseParticipationID),
      )
      filteredCompletions = filteredCompletions.filter((c) =>
        filteredParticipationIds.has(c.courseParticipationID),
      )
    }

    const filteredGrades = filteredCompletions
      .map((c) => c.gradeSuggestion)
      .filter((g) => g !== undefined)

    return {
      participations: filteredParticipations,
      completions: filteredCompletions,
      grades: filteredGrades,
      participationsWithAssessments: filteredParticipationsWithAssessments,
    }
  }, [participations, assessmentCompletions, participationsWithAssessments, filters])

  const isError = isAssessmentsError || isAssessmentCompletionsError
  const isPending = isAssessmentsPending || isAssessmentCompletionsPending

  const refetch = () => {
    refetchAssessments()
    refetchAssessmentCompletions()
  }

  if (isError) {
    return <ErrorPage message='Error loading assessments' onRetry={refetch} />
  }
  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Statistics</ManagementPageHeader>

      <h1>Grade Statistics</h1>

      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
          <FilterMenu filters={filters} setFilters={setFilters} />
        </div>

        <div className='flex flex-wrap gap-2'>
          <FilterBadges filters={filters} onRemoveFilter={setFilters} />
        </div>

        <div className='text-sm text-muted-foreground'>
          Showing {filteredData.participations.length} of {participations?.length ?? 0} participants
          {filteredData.grades.length > 0 && ` with ${filteredData.grades.length} grades`}
        </div>
      </div>

      <div>
        <GradeDistributionDiagram
          participations={filteredData.participations}
          grades={filteredData.grades}
        />
      </div>

      <h1>Score Level Statistics</h1>
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-6'>
        <AssessmentDiagram
          participations={participations}
          scoreLevels={scoreLevels}
          completions={assessmentCompletions}
        />
        <ScoreLevelDistributionDiagram participations={participations} scoreLevels={scoreLevels} />
        <GenderDiagram participationsWithAssessment={filteredData.participationsWithAssessments} />
        <CategoryDiagram categories={categories} assessments={assessments} />
        <AuthorDiagram participationsWithAssessment={filteredData.participationsWithAssessments} />
        <NationalityDiagram
          participationsWithAssessment={filteredData.participationsWithAssessments}
        />
      </div>
    </div>
  )
}
