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
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { Seat } from '../../../../interfaces/Seat'

interface SeatPlanDialogProps {
  seatPlan: Seat[]
}

export const SeatPlanDialog = ({ seatPlan }: SeatPlanDialogProps): JSX.Element => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  return (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Eye className='mr-2 h-4 w-4' />
          View Seat Plan
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Current Seat Plan</DialogTitle>
          <DialogDescription>This seat plan contains {seatPlan.length} seats.</DialogDescription>
        </DialogHeader>

        {/* Render list of seats */}
        <div className='mt-4'>
          {seatPlan.length > 0 ? (
            <ul className='list-disc pl-5'>
              {seatPlan.map((seat, index) => (
                <li key={seat.seatName ?? index}>{seat.seatName}</li>
              ))}
            </ul>
          ) : (
            <p>No seats available.</p>
          )}
        </div>

        <DialogFooter className='mt-4'>
          <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
