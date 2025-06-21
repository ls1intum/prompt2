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
          <DialogTitle>Delete Single Assessment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this assessment? This action cannot be undone and will
            remove this assessment and its comment permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleConfirm} disabled={isDeleting}>
            <Trash2 className='w-4 h-4 mr-2' />
            {isDeleting ? 'Deleting...' : 'Delete Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
