import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ActionDialogProps {
  title: string
  description: string
  confirmLabel: string
  confirmVariant?: 'default' | 'destructive'
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ActionDialog = ({
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  isOpen,
  onClose,
  onConfirm,
}: ActionDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={confirmVariant}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
