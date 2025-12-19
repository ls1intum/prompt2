import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useCourseStore } from '@tumaet/prompt-shared-state'
import { ErrorPage } from '@tumaet/prompt-ui-components'

import {
  AggregatedEvaluationResult,
  StudentAssessmentResults,
} from '../../../interfaces/assessmentResults'
import { CompetencyScore } from '../../../interfaces/competencyScore'
import { StudentAssessment } from '../../../interfaces/studentAssessment'

import { useCoursePhaseConfigStore } from '../../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../../zustand/useMyParticipationStore'
import { useTeamStore } from '../../../zustand/useTeamStore'
import { useStudentAssessmentStore } from '../../../zustand/useStudentAssessmentStore'
import { useSelfEvaluationCategoryStore } from '../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../zustand/usePeerEvaluationCategoryStore'

import { useGetMyAssessmentResults } from '../hooks/useGetMyAssessmentResults'
import { useGetAllCategoriesWithCompetencies } from '../../hooks/useGetAllCategoriesWithCompetencies'
import { getWeightedScoreLevel } from '../../utils/getWeightedScoreLevel'

import { CategoryAssessment } from '../../AssessmentPage/components/CategoryAssessment'
import { AssessmentCompletion } from '../../AssessmentPage/components/AssessmentCompletion/AssessmentCompletion'

const mapAggregatesToScores = (
  results: AggregatedEvaluationResult[],
  courseParticipationID: string,
  coursePhaseID: string,
): CompetencyScore[] =>
  results.map((result) => ({
    id: result.competencyID,
    courseParticipationID,
    coursePhaseID,
    competencyID: result.competencyID,
    scoreLevel: result.averageScoreLevel,
  }))

const buildStudentAssessment = (results: StudentAssessmentResults): StudentAssessment => ({
  courseParticipationID: results.courseParticipationID,
  assessments: results.assessments,
  assessmentCompletion: results.assessmentCompletion,
  studentScore: results.studentScore,
  evaluations: [],
})

export const AssessmentResultsSection = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { isStudentOfCourse } = useCourseStore()
  const isStudent = isStudentOfCourse(courseId ?? '')
  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const resultsReleased = coursePhaseConfig?.resultsReleased ?? false
  const gradingSheetVisible = coursePhaseConfig?.gradingSheetVisible ?? false

  const { myParticipation } = useMyParticipationStore()
  const { teams } = useTeamStore()
  const { setStudentAssessment, setAssessmentParticipation } = useStudentAssessmentStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()

  const shouldFetch = isStudent && resultsReleased
  const shouldFetchCategories = shouldFetch && gradingSheetVisible
  const {
    data: results,
    isPending,
    isError,
    refetch,
  } = useGetMyAssessmentResults({ enabled: shouldFetch })

  const {
    data: assessmentCategories = [],
    isPending: isAssessmentCategoriesPending,
    isError: isAssessmentCategoriesError,
    refetch: refetchAssessmentCategories,
  } = useGetAllCategoriesWithCompetencies({ enabled: shouldFetchCategories })

  useEffect(() => {
    if (!results) return
    setStudentAssessment(buildStudentAssessment(results))
  }, [results, setStudentAssessment])

  useEffect(() => {
    if (!myParticipation) return
    const team = teams.find((t) =>
      t.members.some((member) => member.id === myParticipation.courseParticipationID),
    )
    setAssessmentParticipation({
      ...myParticipation,
      teamID: team?.id ?? '',
    })
  }, [myParticipation, setAssessmentParticipation, teams])

  const selfEvaluationAverage = useMemo(() => {
    if (!results) return undefined
    const scores = mapAggregatesToScores(
      results.selfEvaluationResults,
      results.courseParticipationID,
      results.coursePhaseID,
    )
    const average = getWeightedScoreLevel(scores, selfEvaluationCategories)
    return average > 0 ? average : undefined
  }, [results, selfEvaluationCategories])

  const peerEvaluationAverage = useMemo(() => {
    if (!results) return undefined
    const scores = mapAggregatesToScores(
      results.peerEvaluationResults,
      results.courseParticipationID,
      results.coursePhaseID,
    )
    const average = getWeightedScoreLevel(scores, peerEvaluationCategories)
    return average > 0 ? average : undefined
  }, [peerEvaluationCategories, results])

  if (!resultsReleased || !isStudent) return null
  if (isError || isAssessmentCategoriesError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetch()
          refetchAssessmentCategories()
        }}
      />
    )
  }

  if (isPending || (isAssessmentCategoriesPending && gradingSheetVisible) || !results)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='space-y-4'>
      {gradingSheetVisible &&
        assessmentCategories.map((category) => (
          <CategoryAssessment
            key={category.id}
            category={category}
            assessments={results.assessments.filter((assessment) =>
              category.competencies
                .map((competency) => competency.id)
                .includes(assessment.competencyID),
            )}
            completed={true}
            peerEvaluationResults={results.peerEvaluationResults}
            selfEvaluationResults={results.selfEvaluationResults}
            hidePeerEvaluationDetails={true}
          />
        ))}

      {coursePhaseConfig?.actionItemsVisible || coursePhaseConfig?.gradeSuggestionVisible ? (
        <AssessmentCompletion
          readOnly
          actionItems={results.actionItems}
          selfEvaluationAverage={selfEvaluationAverage}
          peerEvaluationAverage={peerEvaluationAverage}
        />
      ) : null}
    </div>
  )
}
