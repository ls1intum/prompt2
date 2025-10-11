import { Send, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SendStatusMail, PassStatus } from '@tumaet/prompt-shared-state'
import { sendStatusMail } from '@/network/mutations/sendStatusMail'
import { getCoursePhaseParticipationStatusCounts } from '@/network/queries/getCoursePhaseParticipationStatusCounts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@tumaet/prompt-ui-components'

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

  const [mailRecipients, setMailRecipients] = useState({})

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
    sendEmails({ statusMailToBeSend: emailType })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  useEffect(() => {
    const fetchMailRecipientsCount = async () => {
      const d = await getCoursePhaseParticipationStatusCounts(phaseId ?? '')
      setMailRecipients(d)
    }
    fetchMailRecipientsCount()
  }, [phaseId])

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
              `Are you sure you want to send an Email to ALL students that ${emailType === PassStatus.PASSED ? 'have been accepted' : 'have been rejected'}?`}
          </DialogDescription>
          <DialogDescription>
            {!isPending && !isError && !data && (
              <>
                This will send out an email to{' '}
                <span className='font-bold'>
                  {mailRecipients[emailType] ?? 0}{' '}
                  {mailRecipients[emailType] === 1 ? 'recipient' : 'recipients'}
                </span>
              </>
            )}
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
              Successfully sent: {data.successfulEmails ? data.successfulEmails.length : 0} emails
              <br />
              Failed to send: {data.failedEmails ? data.failedEmails.length : 0} emails
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
