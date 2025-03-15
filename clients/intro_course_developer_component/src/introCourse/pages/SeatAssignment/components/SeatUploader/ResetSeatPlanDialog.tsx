import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RefreshCw } from 'lucide-react'

interface ResetSeatPlanDialogProps {
  confirmReset: () => void
  isDeleting: boolean
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
}

export const ResetSeatPlanDialog = ({
  confirmReset,
  isDeleting,
  isDialogOpen,
  setIsDialogOpen,
}: ResetSeatPlanDialogProps): JSX.Element => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' disabled={isDeleting} size='sm'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reset Seat Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Seat Plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the seat plan? This action will delete all current seats
            and{' '}
            <span className='font-semibold'>
              all student and tutor seat assignments will be lost
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={confirmReset} disabled={isDeleting}>
            {isDeleting ? 'Resetting...' : 'Yes, Reset Seat Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
