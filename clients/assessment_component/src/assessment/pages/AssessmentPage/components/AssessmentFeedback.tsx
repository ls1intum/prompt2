import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, Plus, Lock, Loader2 } from 'lucide-react'

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
  ErrorPage,
} from '@tumaet/prompt-ui-components'

import { getAllActionItemsForStudentInPhase } from '../../../network/queries/getAllActionItemsForStudentInPhase'
import { ActionItem } from '../../../interfaces/actionItem'
import { StudentAssessment } from '../../../interfaces/studentAssessment'

interface AssessmentFeedbackProps {
  studentAssessment: StudentAssessment
  deadline?: string
  onMarkAsFinal?: () => void
  completed?: boolean
}

export function AssessmentFeedback({
  studentAssessment,
  deadline = '19.06.2025',
  onMarkAsFinal,
  completed = false,
}: AssessmentFeedbackProps) {
  const { phaseId } = useParams<{
    phaseId: string
  }>()

  const [generalRemarks, setGeneralRemarks] = useState('')

  const {
    data: actionItems,
    isPending,
    isError,
    refetch,
  } = useQuery<ActionItem[]>({
    queryKey: ['actionItem', phaseId, studentAssessment.courseParticipationID],
    queryFn: () =>
      getAllActionItemsForStudentInPhase(phaseId ?? '', studentAssessment.courseParticipationID),
  })

  const [newActionItem, setNewActionItem] = useState('')
  const [gradingSuggestion, setGradingSuggestion] = useState('')

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setNewActionItem('')
    }
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
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {actionItems.map((item) => (
            <div key={item.id} className='flex items-start gap-2 p-4 border rounded-md'>
              <Check className='h-5 w-5 mt-0.5 shrink-0' />
              <p>{item.action}</p>
            </div>
          ))}

          {!completed && (
            <div
              className='flex items-center justify-center p-4 border rounded-md border-dashed cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={addActionItem}
            >
              <Plus className='h-5 w-5 mr-2 text-muted-foreground' />
              <span className='text-muted-foreground'>Add Action Item</span>
            </div>
          )}
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
              <SelectItem value='excellent'>Excellent</SelectItem>
              <SelectItem value='good'>Good</SelectItem>
              <SelectItem value='satisfactory'>Satisfactory</SelectItem>
              <SelectItem value='needs_improvement'>Needs Improvement</SelectItem>
              <SelectItem value='unsatisfactory'>Unsatisfactory</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

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
