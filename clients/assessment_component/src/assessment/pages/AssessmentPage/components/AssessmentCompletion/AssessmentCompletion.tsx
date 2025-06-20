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
  Alert,
  AlertDescription,
} from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'

import { StudentAssessment } from '../../../../interfaces/studentAssessment'

import { ActionItemPanel } from './components/ActionItemPanel'
import { AssessmentCompletionDialog } from './components/AssessmentCompletionDialog'
import { GradeSuggestion } from './components/GradeSuggestion'

import { useCreateOrUpdateAssessmentCompletion } from './hooks/useCreateOrUpdateAssessmentCompletion'
import { useMarkAssessmentAsComplete } from './hooks/useMarkAssessmentAsComplete'
import { useUnmarkAssessmentAsCompleted } from './hooks/useUnmarkAssessmentAsCompleted'

import { validateGrade } from './utils/validateGrade'

interface AssessmentFeedbackProps {
  studentAssessment: StudentAssessment
  deadline?: string
  completed?: boolean
}

export const AssessmentCompletion = ({
  studentAssessment,
  deadline,
  completed = false,
}: AssessmentFeedbackProps) => {
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

        await createOrUpdateCompletion({
          courseParticipationID: studentAssessment.courseParticipationID,
          coursePhaseID: phaseId ?? '',
          comment: newRemarks.trim(),
          gradeSuggestion: gradeValidation.value ?? 5.0,
          author: userName,
          completed: studentAssessment.assessmentCompletion.completed,
        })

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

          <GradeSuggestion
            gradeSuggestion={gradeSuggestion}
            onGradeSuggestionChange={(value) => {
              setGradeSuggestion(value)
              handleSaveFormData(generalRemarks, value)
            }}
            disabled={completed}
          />
        </div>

        <ActionItemPanel studentAssessment={studentAssessment} />
      </div>

      {error && !dialogOpen && (
        <Alert variant='destructive' className='mt-4'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
