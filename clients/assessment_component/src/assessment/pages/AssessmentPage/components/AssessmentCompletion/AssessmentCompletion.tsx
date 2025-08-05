import { useState, useEffect } from 'react'
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

import { useCoursePhaseConfigStore } from '../../../../zustand/useCoursePhaseConfigStore'
import { useStudentAssessmentStore } from '../../../../zustand/useStudentAssessmentStore'

import { AssessmentCompletionDialog } from '../../../components/AssessmentCompletionDialog'
import { DeadlineBadge } from '../../../components/badges'

import { ActionItemPanel } from './components/ActionItemPanel'
import { GradeSuggestion } from './components/GradeSuggestion'

import { useCreateOrUpdateAssessmentCompletion } from './hooks/useCreateOrUpdateAssessmentCompletion'
import { useMarkAssessmentAsComplete } from './hooks/useMarkAssessmentAsComplete'
import { useUnmarkAssessmentAsCompleted } from './hooks/useUnmarkAssessmentAsCompleted'

import { validateGrade } from './utils/validateGrade'

export const AssessmentCompletion = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const deadline = coursePhaseConfig?.deadline || undefined

  const { courseParticipationID, assessmentCompletion } = useStudentAssessmentStore()

  const [generalRemarks, setGeneralRemarks] = useState(assessmentCompletion?.comment || '')
  const [gradeSuggestion, setGradeSuggestion] = useState(
    assessmentCompletion?.gradeSuggestion?.toString() || '',
  )

  useEffect(() => {
    setGeneralRemarks(assessmentCompletion?.comment || '')
    setGradeSuggestion(assessmentCompletion?.gradeSuggestion?.toString() || '')
  }, [assessmentCompletion])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const { mutate: createOrUpdateCompletion, isPending: isCreatePending } =
    useCreateOrUpdateAssessmentCompletion(setError)
  const { mutate: markAsComplete, isPending: isMarkPending } = useMarkAssessmentAsComplete(setError)
  const { mutate: unmarkAsCompleted, isPending: isUnmarkPending } =
    useUnmarkAssessmentAsCompleted(setError)

  const handleButtonClick = () => {
    setError(undefined)
    setDialogOpen(true)
  }

  const isPending = isCreatePending || isMarkPending || isUnmarkPending

  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  const handleConfirm = () => {
    const handleCompletion = async () => {
      try {
        if (assessmentCompletion?.completed ?? false) {
          if (isDeadlinePassed) {
            setError('Cannot unmark assessment as completed: deadline has passed.')
            return
          }
          await unmarkAsCompleted(courseParticipationID ?? '')
        } else {
          const gradeValidation = validateGrade(gradeSuggestion)
          if (!gradeValidation.isValid) {
            setError(`Cannot complete assessment: ${gradeValidation.error}`)
            return
          }

          await markAsComplete({
            courseParticipationID: courseParticipationID ?? '',
            coursePhaseID: phaseId ?? '',
            comment: generalRemarks.trim(),
            gradeSuggestion: gradeValidation.value ?? 5.0,
            author: userName,
            completed: true,
          })
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
        const gradeValidation = validateGrade(newGrade)
        if (!gradeValidation.isValid) {
          setError(`Failed to save: ${gradeValidation.error}`)
          return
        }

        await createOrUpdateCompletion({
          courseParticipationID: courseParticipationID ?? '',
          coursePhaseID: phaseId ?? '',
          comment: newRemarks.trim(),
          gradeSuggestion: gradeValidation.value ?? 5.0,
          author: userName,
          completed: false,
        })

        setError(undefined)
      } catch (err) {
        console.error('Failed to save form data:', err)
        setError('Failed to save form data. Please try again.')
      }
    }
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold tracking-tight'>Finalize your Assessment</h1>

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
                disabled={assessmentCompletion?.completed ?? false}
              />
            </CardContent>
          </Card>

          <GradeSuggestion
            onGradeSuggestionChange={(value) => {
              setGradeSuggestion(value)
              handleSaveFormData(generalRemarks, value)
            }}
          />
        </div>

        <ActionItemPanel />
      </div>

      {error && !dialogOpen && (
        <Alert variant='destructive' className='mt-4'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center mt-8'>
        <div className='flex flex-col'>{deadline && <DeadlineBadge deadline={deadline} />}</div>

        <Button
          size='sm'
          disabled={isPending || (assessmentCompletion?.completed && isDeadlinePassed)}
          onClick={handleButtonClick}
        >
          {assessmentCompletion?.completed ? (
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
        completed={assessmentCompletion?.completed ?? false}
        completedAt={
          assessmentCompletion?.completedAt ? new Date(assessmentCompletion.completedAt) : undefined
        }
        author={assessmentCompletion?.author}
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
