import {
  Dialog,
  Button,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Alert,
  AlertDescription,
} from '@tumaet/prompt-ui-components'

import { format } from 'date-fns'

import { StudentAssessment } from '../../../interfaces/studentAssessment'

interface AssessmentCompletionDialogProps {
  studentAssessment: StudentAssessment
  isPending: boolean
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  handleConfirm: () => void
}

export function AssessmentCompletionDialog({
  studentAssessment,
  isPending,
  dialogOpen,
  setDialogOpen,
  error,
  setError,
  handleConfirm,
}: AssessmentCompletionDialogProps) {
  return (
    <div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setError(null) // Clear error when closing dialog
          setDialogOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {studentAssessment.assessmentCompletion.completed
                ? 'Reopen Assessment for Editing'
                : 'Mark Assessment as Final'}
            </DialogTitle>
            <DialogDescription>
              {studentAssessment.assessmentCompletion.completed ? (
                <>
                  Marked as final by {studentAssessment.assessmentCompletion.author} at{' '}
                  {format(
                    new Date(studentAssessment.assessmentCompletion.completedAt),
                    'MMM d, yyyy',
                  )}
                  <br />
                  Are you sure you want to reopen this assessment for editing? This will allow you
                  to make changes to the assessment.
                </>
              ) : (
                'Are you sure you want to mark this assessment as final? This will lock the assessment and prevent further changes.'
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={studentAssessment.assessmentCompletion.completed ? 'destructive' : 'default'}
            >
              {isPending
                ? 'Processing...'
                : studentAssessment.assessmentCompletion.completed
                  ? 'Yes, Reopen for Editing'
                  : 'Yes, Mark as Final'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
