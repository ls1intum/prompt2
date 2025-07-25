import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Lock, Unlock } from 'lucide-react'

import { Button, Alert, AlertDescription } from '@tumaet/prompt-ui-components'

import { AssessmentCompletionDialog } from '../../../components/AssessmentCompletionDialog'
import { DeadlineBadge } from '../../../components/DeadlineBadge'

import { useMarkMyEvaluationAsCompleted } from './hooks/useMarkMyEvaluationAsCompleted'
import { useUnmarkMyEvaluationAsCompleted } from './hooks/useUnmarkMyEvaluationAsCompleted'

import { FeedbackItemPanel } from './components/FeedbackItemPanel'

interface EvaluationCompletionPageProps {
  deadline: Date
  courseParticipationID: string
  authorCourseParticipationID: string
  completed?: boolean
  completedAt?: Date
}

export const EvaluationCompletionPage = ({
  deadline,
  courseParticipationID,
  authorCourseParticipationID,
  completed = false,
  completedAt,
}: EvaluationCompletionPageProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const { mutate: markAsComplete, isPending: isMarkPending } =
    useMarkMyEvaluationAsCompleted(setError)
  const { mutate: unmarkAsCompleted, isPending: isUnmarkPending } =
    useUnmarkMyEvaluationAsCompleted(setError)

  const handleButtonClick = () => {
    setError(undefined)
    setDialogOpen(true)
  }

  const isPending = isMarkPending || isUnmarkPending

  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false

  const handleConfirm = () => {
    const handleCompletion = async () => {
      try {
        if (completed) {
          if (isDeadlinePassed) {
            setError('Cannot unmark evaluation as completed: deadline has passed.')
            return
          }
          await unmarkAsCompleted({
            courseParticipationID: courseParticipationID,
            coursePhaseID: phaseId ?? '',
            authorCourseParticipationID: authorCourseParticipationID,
          })
        } else {
          await markAsComplete({
            courseParticipationID: courseParticipationID,
            coursePhaseID: phaseId ?? '',
            authorCourseParticipationID: authorCourseParticipationID,
          })
        }
        setDialogOpen(false)
      } catch (err) {
        setError('An error occurred while updating the completion status.')
      }
    }

    handleCompletion()
  }

  return (
    <div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <FeedbackItemPanel
          feedbackType='negative'
          courseParticipationID={courseParticipationID}
          authorCourseParticipationID={authorCourseParticipationID}
          completed={completed}
        />
        <FeedbackItemPanel
          feedbackType='positive'
          courseParticipationID={courseParticipationID}
          authorCourseParticipationID={authorCourseParticipationID}
          completed={completed}
        />
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
              <DeadlineBadge
                deadline={deadline}
                type={courseParticipationID === authorCourseParticipationID ? 'self' : 'peer'}
              />
              {isDeadlinePassed && (
                <span className='text-red-600 ml-2 font-medium'>(Deadline has passed)</span>
              )}
            </div>
          )}
          {isDeadlinePassed && completed && (
            <div className='text-sm text-red-600 mt-1'>
              Cannot be unmarked as final after the deadline has passed.
            </div>
          )}
        </div>

        <Button
          size='sm'
          disabled={isPending || (completed && isDeadlinePassed)}
          onClick={handleButtonClick}
        >
          {completed ? (
            <span className='flex items-center gap-1'>
              <Unlock className='h-3.5 w-3.5' />
              Unmark as Final
            </span>
          ) : (
            <span className='flex items-center gap-1'>
              <Lock className='h-3.5 w-3.5' />
              Mark as Final
            </span>
          )}
        </Button>
      </div>

      <AssessmentCompletionDialog
        completed={completed}
        completedAt={completedAt}
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
