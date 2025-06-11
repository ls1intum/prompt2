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
  completed?: boolean
}

export function AssessmentCompletion({
  studentAssessment,
  deadline = '19.06.2025',
  completed = false,
}: AssessmentFeedbackProps) {
  const { phaseId } = useParams<{ phaseId: string }>()

  const [generalRemarks, setGeneralRemarks] = useState(
    studentAssessment.assessmentCompletion?.comment || '',
  )
  const [gradeSuggestion, setGradeSuggestion] = useState(
    studentAssessment.assessmentCompletion?.gradeSuggestion?.toString() || '',
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const validGradeValues = [1, 1.3, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 5]

  const validateGrade = (
    gradeString: string,
  ): { isValid: boolean; value?: number; error?: string } => {
    if (!gradeString || gradeString.trim() === '') {
      return { isValid: true, value: 5.0 } // Default value when empty
    }

    const gradeValue = parseFloat(gradeString)

    if (isNaN(gradeValue)) {
      return { isValid: false, error: 'Grade must be a valid number' }
    }

    if (gradeValue < 1 || gradeValue > 5) {
      return { isValid: false, error: 'Grade must be between 1.0 and 5.0' }
    }

    // Check if the grade matches one of the valid values (with small tolerance for floating point comparison)
    const isValidValue = validGradeValues.some(
      (validValue) => Math.abs(validValue - gradeValue) < 0.01,
    )

    if (!isValidValue) {
      return {
        isValid: false,
        error: `Grade must be one of the predefined values (${validGradeValues.join(', ')})`,
      }
    }

    return { isValid: true, value: gradeValue }
  }

  const handleConfirm = () => {
    const handleCompletion = async () => {
      try {
        if (studentAssessment.assessmentCompletion.completed) {
          await unmarkAsCompleted(studentAssessment.courseParticipationID)
        } else {
          // Validate grade before final submission
          const gradeValidation = validateGrade(gradeSuggestion)
          if (!gradeValidation.isValid) {
            setError(`Cannot complete assessment: ${gradeValidation.error}`)
            return
          }

          const completionData = {
            courseParticipationID: studentAssessment.courseParticipationID,
            coursePhaseID: phaseId ?? '',
            comment: generalRemarks.trim(),
            gradeSuggestion: gradeValidation.value ?? 5.0,
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

  const handleSaveFormData = async (newRemarks: string, newGrade: string) => {
    if (newRemarks.trim() || newGrade) {
      try {
        // Validate grade before saving
        const gradeValidation = validateGrade(newGrade)
        if (!gradeValidation.isValid) {
          setError(`Failed to save: ${gradeValidation.error}`)
          return
        }

        const completionData = {
          courseParticipationID: studentAssessment.courseParticipationID,
          coursePhaseID: phaseId ?? '',
          comment: newRemarks.trim(),
          gradeSuggestion: gradeValidation.value ?? 5.0,
          author: userName,
          completed: studentAssessment.assessmentCompletion.completed,
        }
        await createOrUpdateCompletion(completionData)

        // Clear any existing errors on successful save
        setError(null)
      } catch (err) {
        console.error('Failed to save form data:', err)
        setError('Failed to save form data. Please try again.')
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
                onBlur={() => handleSaveFormData(generalRemarks, gradeSuggestion)}
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
                value={gradeSuggestion}
                onValueChange={(value) => {
                  setGradeSuggestion(value)
                  handleSaveFormData(generalRemarks, value)
                }}
                disabled={completed}
              >
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
