import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tumaet/prompt-ui-components'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface ResetSeatAssignmentDialogProps {
  disabled: boolean
  onSuccess: () => void
}

export const ResetSeatAssignmentDialog = ({
  disabled,
  onSuccess,
}: ResetSeatAssignmentDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='text-red-600 border-red-20' disabled={disabled}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reset Assignments
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Student Assignments</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset all student assignments? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() => {
              onSuccess()
              setIsDialogOpen(false)
            }}
          >
            Yes, Reset Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
