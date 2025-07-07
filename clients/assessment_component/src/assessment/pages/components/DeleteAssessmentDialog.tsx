import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@tumaet/prompt-ui-components'

interface DeleteAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const DeleteAssessmentDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteAssessmentDialogProps) => {
  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Assessment</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset this assessment? This action cannot be undone and you
            will have to complete this assessment and its comment again afterward.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleConfirm} disabled={isDeleting}>
            <Trash2 className='w-4 h-4 mr-2' />
            {isDeleting ? 'Resetting...' : 'Reset Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
