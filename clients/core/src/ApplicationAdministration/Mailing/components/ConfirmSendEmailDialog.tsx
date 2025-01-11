import { Send, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { SendStatusMail } from '@/interfaces/send_status_mail'
import { sendStatusMail } from '../../../network/mutations/sendStatusMail'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ConfirmSendEmailDialogProps {
  isOpen: boolean
  onClose: () => void
  emailType: PassStatus
}

export const ConfirmSendEmailDialog = ({
  isOpen,
  onClose,
  emailType,
}: ConfirmSendEmailDialogProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    mutate: sendEmails,
    isPending,
    isError,
    error,
    data,
    reset,
  } = useMutation({
    mutationFn: (statusToSend: SendStatusMail) => {
      return sendStatusMail(phaseId ?? 'undefined', statusToSend)
    },
  })

  const onConfirm = () => {
    sendEmails({ status_mail_to_be_send: emailType })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isPending
              ? 'Sending Emails'
              : isError
                ? 'Error'
                : data
                  ? 'Email Send Results'
                  : 'Confirm Email Send'}
          </DialogTitle>
          <DialogDescription>
            {!isPending &&
              !isError &&
              !data &&
              `Are you sure you want to an email to ALL students that ${emailType === PassStatus.PASSED ? 'have been accepted' : 'have been rejected'}?`}
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <Alert>
            <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
            <AlertTitle>Sending Mails</AlertTitle>
            <AlertDescription>Please wait while we process your request.</AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error?.message || 'An unexpected error occurred.'}</AlertDescription>
          </Alert>
        )}

        {data && (
          <Alert>
            <CheckCircle className='h-4 w-4 text-green-500' />
            <AlertTitle>Email Send Results</AlertTitle>
            <AlertDescription>
              Successfully sent: {data.successful_emails ? data.successful_emails.length : 0} emails
              <br />
              Failed to send: {data.failed_emails ? data.failed_emails.length : 0} emails
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {!isPending && !isError && !data && (
            <>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>
                <Send className='mr-2 h-4 w-4' />
                Confirm Send
              </Button>
            </>
          )}
          {(isError || data) && (
            <Button onClick={handleClose}>
              <X className='mr-2 h-4 w-4' />
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
