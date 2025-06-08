import { useState } from 'react'
import { Lock } from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tumaet/prompt-ui-components'

import { StudentAssessment } from '../../../../interfaces/studentAssessment'
import { ActionItemPanel } from './components/ActionItemPanel'

interface AssessmentFeedbackProps {
  studentAssessment: StudentAssessment
  deadline?: string
  onMarkAsFinal?: () => void
  completed?: boolean
}

export function AssessmentCompletion({
  studentAssessment,
  deadline = '19.06.2025',
  onMarkAsFinal,
  completed = false,
}: AssessmentFeedbackProps) {
  const [generalRemarks, setGeneralRemarks] = useState('')

  const [gradingSuggestion, setGradingSuggestion] = useState('')

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>General Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder='What did this person particularly well?'
            className='min-h-[100px]'
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
            disabled={completed}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grading Suggestion</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={gradingSuggestion}
            onValueChange={setGradingSuggestion}
            disabled={completed}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a Grading Suggestion for this Student ...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1.0'>1.0 - Excellent</SelectItem>
              <SelectItem value='1.3'>1.3 - Very Good</SelectItem>
              <SelectItem value='1.7'>1.7 - Good</SelectItem>
              <SelectItem value='2.0'>2.0 - Good</SelectItem>
              <SelectItem value='2.3'>2.3 - Satisfactory</SelectItem>
              <SelectItem value='2.7'>2.7 - Satisfactory</SelectItem>
              <SelectItem value='3.0'>3.0 - Satisfactory</SelectItem>
              <SelectItem value='3.3'>3.3 - Sufficient</SelectItem>
              <SelectItem value='3.7'>3.7 - Sufficient</SelectItem>
              <SelectItem value='4.0'>4.0 - Sufficient</SelectItem>
              <SelectItem value='5.0'>5.0 - Fail</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <ActionItemPanel studentAssessment={studentAssessment} />

      <div className='flex justify-between items-center mt-8'>
        <div className='text-muted-foreground'>Deadline: {deadline}</div>
        <Button
          variant='default'
          className='bg-black hover:bg-gray-800 text-white'
          onClick={onMarkAsFinal}
          disabled={completed}
        >
          <Lock className='mr-2 h-4 w-4' />
          Mark Assessment as Final
        </Button>
      </div>
    </div>
  )
}
