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

import { useSelfEvaluationCategoryStore } from '../../../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../../../zustand/usePeerEvaluationCategoryStore'
import { useStudentAssessmentStore } from '../../../../../zustand/useStudentAssessmentStore'
import { mapNumberToScoreLevel } from '../../../../../interfaces/scoreLevel'

import { getWeightedScoreLevel } from '../../../../utils/getWeightedScoreLevel'
import { StudentScoreBadge } from '../../../../components/StudentScoreBadge'

interface GradeSuggestionProps {
  onGradeSuggestionChange: (value: string) => void
}

export const GradeSuggestion = ({ onGradeSuggestionChange }: GradeSuggestionProps) => {
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { studentScore, assessmentCompletion, selfEvaluations, peerEvaluations } =
    useStudentAssessmentStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Suggestion</CardTitle>
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
          Will be shown to students after the deadline
        </p>
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
            <p className='text-sm text-muted-foreground'>Platform recommendation:</p>
            <StudentScoreBadge
              scoreLevel={studentScore.scoreLevel}
              scoreNumeric={studentScore.scoreNumeric}
              showTooltip={true}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Select
          value={assessmentCompletion?.gradeSuggestion.toFixed(1) ?? ''}
          onValueChange={onGradeSuggestionChange}
          disabled={assessmentCompletion?.completed ?? false}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a Grade Suggestion for this Student ...' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1.0'>Very Good - 1.0</SelectItem>
            <SelectItem value='1.3'>Very Good - 1.3</SelectItem>
            <SelectItem value='1.7'>Good - 1.7</SelectItem>
            <SelectItem value='2.0'>Good - 2.0</SelectItem>
            <SelectItem value='2.3'>Good - 2.3</SelectItem>
            <SelectItem value='2.7'>Satisfactory - 2.7</SelectItem>
            <SelectItem value='3.0'>Satisfactory - 3.0</SelectItem>
            <SelectItem value='3.3'>Satisfactory - 3.3</SelectItem>
            <SelectItem value='3.7'>Sufficient - 3.7</SelectItem>
            <SelectItem value='4.0'>Sufficient - 4.0</SelectItem>
            <SelectItem value='5.0'>Fail - 5.0</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
