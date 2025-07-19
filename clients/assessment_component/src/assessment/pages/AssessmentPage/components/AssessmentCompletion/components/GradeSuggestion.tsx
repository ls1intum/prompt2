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

import { useStudentAssessmentStore } from '../../../../../zustand/useStudentAssessmentStore'

import { StudentScoreBadge } from '../../../../components/StudentScoreBadge'

interface GradeSuggestionProps {
  onGradeSuggestionChange: (value: string) => void
}

export const GradeSuggestion = ({ onGradeSuggestionChange }: GradeSuggestionProps) => {
  const { studentScore, assessmentCompletion } = useStudentAssessmentStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Suggestion</CardTitle>
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
          Will be shown to students after the deadline
        </p>
        {studentScore && studentScore.scoreNumeric > 0 ? (
          <div className='flex flex-row items-center gap-2'>
            <p className='text-sm text-muted-foreground'>Platform recommendation:</p>
            <StudentScoreBadge
              scoreLevel={studentScore.scoreLevel}
              scoreNumeric={studentScore.scoreNumeric}
            />
          </div>
        ) : undefined}
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
            <SelectItem value='1'>Very Good - 1.0</SelectItem>
            <SelectItem value='1.3'>Very Good - 1.3</SelectItem>
            <SelectItem value='1.7'>Good - 1.7</SelectItem>
            <SelectItem value='2'>Good - 2.0</SelectItem>
            <SelectItem value='2.3'>Good - 2.3</SelectItem>
            <SelectItem value='2.7'>Satisfactory - 2.7</SelectItem>
            <SelectItem value='3'>Satisfactory - 3.0</SelectItem>
            <SelectItem value='3.3'>Satisfactory - 3.3</SelectItem>
            <SelectItem value='3.7'>Sufficient - 3.7</SelectItem>
            <SelectItem value='4'>Sufficient - 4.0</SelectItem>
            <SelectItem value='5'>Fail - 5.0</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
