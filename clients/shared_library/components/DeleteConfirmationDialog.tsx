import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmationProps {
  isOpen: boolean
  setOpen: (value: boolean) => void
  deleteMessage: string
  customWarning?: string
  onClick: (value: boolean) => void // returns true for delete, false for not delete
}

export const DeleteConfirmation = ({
  isOpen,
  setOpen,
  deleteMessage,
  customWarning,
  onClick,
}: DeleteConfirmationProps) => {
  const handleClick = (value: boolean) => {
    setOpen(false)
    onClick(value)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2 text-red-600'>
            <AlertTriangle className='h-5 w-5' />
            Confirm Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className='text-base'>{deleteMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className='mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground'>
          {customWarning
            ? customWarning
            : 'This action cannot be undone and may result in data deletion.'}
        </div>
        <AlertDialogFooter className='mt-6 flex-col-reverse sm:flex-row'>
          <AlertDialogCancel onClick={() => handleClick(false)} className='mt-3 sm:mt-0'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleClick(true)}
            className='bg-red-600 hover:bg-red-700 text-white'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
