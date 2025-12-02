import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tumaet/prompt-ui-components'

import { useCoursePhaseConfigStore } from '../../../../../zustand/useCoursePhaseConfigStore'
import { useSelfEvaluationCategoryStore } from '../../../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../../../zustand/usePeerEvaluationCategoryStore'
import { useStudentAssessmentStore } from '../../../../../zustand/useStudentAssessmentStore'
import { mapNumberToScoreLevel } from '@tumaet/prompt-shared-state'

import { getWeightedScoreLevel } from '../../../../utils/getWeightedScoreLevel'
import { GRADE_SELECT_OPTIONS } from '../../../../utils/gradeConfig'

import { StudentScoreBadge } from '../../../../components/badges'

interface GradeSuggestionProps {
  onGradeSuggestionChange: (value: string) => void
}

export const GradeSuggestion = ({ onGradeSuggestionChange }: GradeSuggestionProps) => {
  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { studentScore, assessmentCompletion, selfEvaluations, peerEvaluations } =
    useStudentAssessmentStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='mb-3'>Grade</CardTitle>
        {selfEvaluations &&
          selfEvaluations.length > 1 &&
          (() => {
            const weightedScoreLevel = getWeightedScoreLevel(
              selfEvaluations,
              selfEvaluationCategories,
            )
            return (
              <div className='flex flex-row items-center gap-2'>
                <p className='text-sm text-muted-foreground'>Self Evaluation Average:</p>
                <StudentScoreBadge
                  scoreLevel={mapNumberToScoreLevel(weightedScoreLevel)}
                  scoreNumeric={weightedScoreLevel}
                />
              </div>
            )
          })()}
        {peerEvaluations &&
          peerEvaluations.length > 1 &&
          (() => {
            const weightedScoreLevel = getWeightedScoreLevel(
              peerEvaluations,
              peerEvaluationCategories,
            )
            return (
              <div className='flex flex-row items-center gap-2'>
                <p className='text-sm text-muted-foreground'>Peer Evaluation Average:</p>
                <StudentScoreBadge
                  scoreLevel={mapNumberToScoreLevel(weightedScoreLevel)}
                  scoreNumeric={weightedScoreLevel}
                />
              </div>
            )
          })()}
        {studentScore && studentScore.scoreNumeric > 0 && (
          <div className='flex flex-row items-center gap-2'>
            <p className='text-sm text-muted-foreground'>Your Assessment Average:</p>
            <StudentScoreBadge
              scoreLevel={studentScore.scoreLevel}
              scoreNumeric={studentScore.scoreNumeric}
              showTooltip={true}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Your Grade Suggestion
        </p>
        {coursePhaseConfig?.gradeSuggestionVisible && (
          <p className='text-xs text-gray-500 dark:text-gray-400 my-1'>
            Your suggestion will be visible to the student after the assessment deadline.
          </p>
        )}
        <Select
          value={assessmentCompletion?.gradeSuggestion.toFixed(1) ?? ''}
          onValueChange={onGradeSuggestionChange}
          disabled={assessmentCompletion?.completed ?? false}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a Grade Suggestion for this Student ...' />
          </SelectTrigger>
          <SelectContent>
            {GRADE_SELECT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
