import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { useState } from 'react'
import { ConfirmSendEmailDialog } from './ConfirmSendEmailDialog'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'

interface ManualMailSendingProps {
  mailingMetaData: ApplicationMailingMetaData | null
}

export const ManualMailSending = ({ mailingMetaData }: ManualMailSendingProps): JSX.Element => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [sendEmailType, setSendEmailType] = useState<PassStatus | null>(null)

  return (
    <>
      <h3 className='text-lg font-medium'>Manual Email Sending</h3>
      <div className='mt-4 flex space-x-4'>
        <Button
          disabled={
            mailingMetaData?.replyToEmail === '' ||
            mailingMetaData?.replyToName === '' ||
            mailingMetaData?.passedMailContent === '' ||
            mailingMetaData?.passedMailSubject === ''
          }
          className='w-full flex items-center justify-center space-x-2'
          onClick={(e) => {
            e.preventDefault()
            setSendEmailType(PassStatus.PASSED)
            setConfirmationDialogOpen(true)
          }}
        >
          <Send className='h-4 w-4' />
          <span>Send Acceptance Emails</span>
        </Button>
        <Button
          disabled={
            mailingMetaData?.replyToEmail === '' ||
            mailingMetaData?.replyToName === '' ||
            mailingMetaData?.failedMailContent === '' ||
            mailingMetaData?.failedMailSubject === ''
          }
          className='w-full flex items-center justify-center space-x-2'
          onClick={(e) => {
            e.preventDefault()
            setSendEmailType(PassStatus.FAILED)
            setConfirmationDialogOpen(true)
          }}
        >
          <Send className='h-4 w-4' />
          <span>Send Rejection Emails</span>
        </Button>
      </div>
      {confirmationDialogOpen && sendEmailType && (
        <ConfirmSendEmailDialog
          isOpen={confirmationDialogOpen}
          onClose={() => setConfirmationDialogOpen(false)}
          emailType={sendEmailType}
        />
      )}
    </>
  )
}
