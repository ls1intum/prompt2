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
        <div className='flex flex-row items-center gap-2'>
          <p className='text-sm text-muted-foreground'>
            Platform suggestion based on assessment results:
          </p>
          <StudentScoreBadge
            scoreLevel={studentScore.scoreLevel}
            scoreNumeric={studentScore.scoreNumeric}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Select value={gradeSuggestion} onValueChange={onGradeSuggestionChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder='Select a Grade Suggestion for this Student ...' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1'>1.0 - Excellent</SelectItem>
            <SelectItem value='1.3'>1.3 - Very Good</SelectItem>
            <SelectItem value='1.7'>1.7 - Good</SelectItem>
            <SelectItem value='2'>2.0 - Good</SelectItem>
            <SelectItem value='2.3'>2.3 - Satisfactory</SelectItem>
            <SelectItem value='2.7'>2.7 - Satisfactory</SelectItem>
            <SelectItem value='3'>3.0 - Satisfactory</SelectItem>
            <SelectItem value='3.3'>3.3 - Sufficient</SelectItem>
            <SelectItem value='3.7'>3.7 - Sufficient</SelectItem>
            <SelectItem value='4'>4.0 - Sufficient</SelectItem>
            <SelectItem value='5'>5.0 - Fail</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
