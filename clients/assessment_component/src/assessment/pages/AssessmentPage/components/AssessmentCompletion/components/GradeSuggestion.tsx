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

import { StudentScore } from '../../../../../interfaces/studentScore'

import { StudentScoreBadge } from '../../../../components/StudentScoreBadge'

interface GradeSuggestionProps {
  studentScore: StudentScore
  gradeSuggestion: string
  onGradeSuggestionChange: (value: string) => void
  disabled?: boolean
}

export const GradeSuggestion = ({
  studentScore,
  gradeSuggestion,
  onGradeSuggestionChange,
  disabled = false,
}: GradeSuggestionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Suggestion</CardTitle>
        {studentScore.scoreNumeric > 0 ? (
          <div className='flex flex-row items-center gap-2'>
            <p className='text-sm text-muted-foreground'>Platform recommendation:</p>
            <StudentScoreBadge
              scoreLevel={studentScore.scoreLevel}
              scoreNumeric={studentScore.scoreNumeric}
              showTooltip={true}
            />
          </div>
        ) : undefined}
      </CardHeader>
      <CardContent>
        <Select value={gradeSuggestion} onValueChange={onGradeSuggestionChange} disabled={disabled}>
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
