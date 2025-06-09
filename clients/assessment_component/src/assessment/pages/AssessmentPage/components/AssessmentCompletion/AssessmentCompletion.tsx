import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Unlock } from 'lucide-react'

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
  Alert,
  AlertDescription,
} from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'

import { StudentAssessment } from '../../../../interfaces/studentAssessment'

import { ActionItemPanel } from './components/ActionItemPanel'
import { AssessmentCompletionDialog } from './components/AssessmentCompletionDialog'

import { useCreateOrUpdateAssessmentCompletion } from './hooks/useCreateOrUpdateAssessmentCompletion'
import { useMarkAssessmentAsComplete } from './hooks/useMarkAssessmentAsComplete'
import { useUnmarkAssessmentAsCompleted } from './hooks/useUnmarkAssessmentAsCompleted'

interface AssessmentFeedbackProps {
  studentAssessment: StudentAssessment
  deadline?: string
  onMarkAsFinal?: () => void
  completed?: boolean
}

export function AssessmentCompletion({
  studentAssessment,
  deadline = '19.06.2025',
  completed = false,
}: AssessmentFeedbackProps) {
  // Initialize form fields with existing data if available
  const [generalRemarks, setGeneralRemarks] = useState(
    studentAssessment.assessmentCompletion?.comment || '',
  )
  const [gradingSuggestion, setGradingSuggestion] = useState(
    studentAssessment.assessmentCompletion?.gradeSuggestion?.toString() || '',
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { phaseId } = useParams<{ phaseId: string }>()

  const { mutate: createOrUpdateCompletion, isPending: isCreatePending } =
    useCreateOrUpdateAssessmentCompletion(setError)
  const { mutate: markAsComplete, isPending: isMarkPending } = useMarkAssessmentAsComplete(setError)
  const { mutate: unmarkAsCompleted, isPending: isUnmarkPending } =
    useUnmarkAssessmentAsCompleted(setError)

  const handleButtonClick = () => {
    setError(null)
    setDialogOpen(true)
  }

  const isPending = isCreatePending || isMarkPending || isUnmarkPending

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  const handleConfirm = () => {
    const handleCompletion = async () => {
      try {
        if (studentAssessment.assessmentCompletion.completed) {
          // If currently completed, unmark it
          await unmarkAsCompleted(studentAssessment.courseParticipationID)
        } else {
          // If not completed, mark as complete with current form data
          const completionData = {
            courseParticipationID: studentAssessment.courseParticipationID,
            coursePhaseID: phaseId ?? '',
            comment: generalRemarks.trim(),
            gradeSuggestion: gradingSuggestion ? parseFloat(gradingSuggestion) : undefined,
            author: userName,
            completed: true,
          }
          await markAsComplete(completionData)
        }
        setDialogOpen(false)
      } catch (err) {
        setError('An error occurred while updating the assessment completion status.')
      }
    }

    handleCompletion()
  }

  // Save form data whenever it changes (auto-save functionality)
  const handleSaveFormData = async () => {
    if (generalRemarks.trim() || gradingSuggestion) {
      try {
        const completionData = {
          courseParticipationID: studentAssessment.courseParticipationID,
          coursePhaseID: phaseId ?? '',
          comment: generalRemarks.trim(),
          gradeSuggestion: gradingSuggestion ? parseFloat(gradingSuggestion) : undefined,
          author: userName,
          completed: studentAssessment.assessmentCompletion.completed,
        }
        await createOrUpdateCompletion(completionData)
      } catch (err) {
        console.error('Failed to save form data:', err)
      }
    }
  }

  return (
    <div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='grid grid-cols-1 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>General Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='What did this person do particularly well?'
                className='min-h-[100px]'
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                onBlur={handleSaveFormData}
                disabled={completed}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={gradingSuggestion}
                onValueChange={(value) => {
                  setGradingSuggestion(value)
                  // Save immediately when grade suggestion changes
                  setTimeout(handleSaveFormData, 100)
                }}
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
        </div>

        <ActionItemPanel studentAssessment={studentAssessment} />
      </div>

      <div className='flex justify-between items-center mt-8'>
        <div className='text-muted-foreground'>Deadline: {deadline}</div>
        <Button size='sm' disabled={isPending} onClick={handleButtonClick}>
          {studentAssessment.assessmentCompletion.completed ? (
            <span className='flex items-center gap-1'>
              <Unlock className='h-3.5 w-3.5' />
              Unmark as Final
            </span>
          ) : (
            <span className='flex items-center gap-1'>
              <Lock className='h-3.5 w-3.5' />
              Mark Assessment as Final
            </span>
          )}
        </Button>

        {error && !dialogOpen && (
          <Alert variant='destructive' className='mt-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <AssessmentCompletionDialog
        studentAssessment={studentAssessment}
        isPending={isPending}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        error={error}
        setError={setError}
        handleConfirm={handleConfirm}
      />
    </div>
  )
}
