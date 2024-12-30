import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ApplicationDetailsViewProps {
  coursePhaseParticipationID: string
  open: boolean
  onClose: () => void
}

export const ApplicationDetailsView = ({
  coursePhaseParticipationID,
  open,
  onClose,
}: ApplicationDetailsViewProps): JSX.Element => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <div>Some fancy detail view here</div>
        {coursePhaseParticipationID}
      </DialogContent>
    </Dialog>
  )
}
