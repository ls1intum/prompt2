'use client'

import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ApplicationSavingDialogProps {
  showDialog: 'saving' | 'success' | 'error' | null
  onClose: () => void
  onNavigateBack: () => void
  errorMessage?: string
}

export const ApplicationSavingDialog = ({
  showDialog,
  onClose,
  onNavigateBack,
  errorMessage,
}: ApplicationSavingDialogProps): JSX.Element => {
  const isOpen = showDialog !== null

  const getDialogContent = () => {
    switch (showDialog) {
      case 'saving':
        return {
          title: 'Saving Application',
          description: 'Please wait while we save your application...',
          icon: <Loader2 className='h-6 w-6 animate-spin text-blue-500' />,
        }
      case 'success':
        return {
          title: 'Application Saved',
          description: 'Your application was successfully saved!',
          icon: <CheckCircle className='h-6 w-6 text-green-500' />,
        }
      case 'error':
        if (errorMessage?.includes('student details do not match')) {
          return {
            title: 'Registration Error',
            description:
              'This email is already registered, but with a different name. Please contact an instructor.',
            icon: <AlertCircle className='h-6 w-6 text-yellow-500' />,
          }
        } else if (errorMessage?.includes('application already exists')) {
          return {
            title: 'Duplicate Application',
            description:
              'There is already an application registered to this course with this email. ' +
              'Without a university account, you cannot modify your application after submission.',
            icon: <XCircle className='h-6 w-6 text-red-500' />,
          }
        } else {
          return {
            title: 'Error',
            description: `An error occurred while saving your application. Please try again later.`,
            icon: <XCircle className='h-6 w-6 text-red-500' />,
          }
        }
      default:
        return null
    }
  }

  const dialogContent = getDialogContent()

  if (!dialogContent) return <></>

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {dialogContent.icon}
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {showDialog === 'saving' ? (
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Please wait
            </Button>
          ) : showDialog === 'success' ? (
            <Button onClick={onNavigateBack}>OK</Button>
          ) : (
            <Button variant='destructive' onClick={onClose}>
              Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
