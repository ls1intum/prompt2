import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Unlock } from 'lucide-react'

import { format } from 'date-fns'

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
import { useDeadlineStore } from '../../../../zustand/useDeadlineStore'

import { validateGrade } from './utils/validateGrade'

interface AssessmentFeedbackProps {
  studentAssessment: StudentAssessment
  completed?: boolean
}

export const AssessmentCompletion = ({
  studentAssessment,
  completed = false,
}: AssessmentFeedbackProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { deadline } = useDeadlineStore()

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

  // Check if deadline has passed
  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  const handleConfirm = () => {
    const handleCompletion = async () => {
      try {
        if (studentAssessment.assessmentCompletion.completed) {
          // Check if deadline has passed before unmarking
          if (isDeadlinePassed) {
            setError('Cannot unmark assessment as completed: deadline has passed.')
            return
          }
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
            studentScore={studentAssessment.studentScore}
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
        <div className='flex flex-col'>
          {deadline && (
            <div className='text-muted-foreground'>
              Deadline: {deadline ? format(new Date(deadline), 'dd.MM.yyyy') : 'No deadline set'}
              {isDeadlinePassed && (
                <span className='text-red-600 ml-2 font-medium'>(Deadline has passed)</span>
              )}
            </div>
          )}
          {isDeadlinePassed && studentAssessment.assessmentCompletion.completed && (
            <div className='text-sm text-red-600 mt-1'>
              Assessments cannot be unmarked as final after the deadline has passed.
            </div>
          )}
        </div>

        <Button
          size='sm'
          disabled={
            isPending || (studentAssessment.assessmentCompletion.completed && isDeadlinePassed)
          }
          onClick={handleButtonClick}
        >
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
        isDeadlinePassed={isDeadlinePassed}
      />
    </div>
  )
}
