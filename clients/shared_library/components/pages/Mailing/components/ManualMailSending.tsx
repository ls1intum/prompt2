import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { PassStatus, CoursePhaseMailingConfigData } from '@tumaet/prompt-shared-state'
import { useState } from 'react'
import { ConfirmSendEmailDialog } from './ConfirmSendEmailDialog'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ManualMailSendingProps {
  mailingMetaData: CoursePhaseMailingConfigData | null
  isModified: boolean
}

export const ManualMailSending = ({
  mailingMetaData,
  isModified,
}: ManualMailSendingProps): JSX.Element => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [sendEmailType, setSendEmailType] = useState<PassStatus | null>(null)

  // TODO: AFTER shared library!!!
  // const courseMailingIsConfigured = useGetMailingIsConfigured()

  const isDisabled = (type: PassStatus) => {
    if (isModified) return true

    const contentCheck =
      type === PassStatus.PASSED
        ? mailingMetaData?.passedMailContent && mailingMetaData?.passedMailSubject
        : mailingMetaData?.failedMailContent && mailingMetaData?.failedMailSubject

    return !contentCheck
    // return !(contentCheck && courseMailingIsConfigured)
  }

  const tooltipMessage = 'Configure the mail and save changes before sending.'
  // const tooltipMessage = courseMailingIsConfigured
  //   ? 'Configure the mailing in the course mail settings before sending.'
  //   : 'Configure the mail and save changes before sending.'

  return (
    <>
      <TooltipProvider>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div className='space-y-0.5'>
            <Label>Manual Acceptance Emails</Label>
            <p className='text-sm text-muted-foreground'>
              Send an acceptance mail to ALL accepted students.
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className='w-full sm:w-auto'
                variant='outline'
                onClick={(e) => {
                  e.preventDefault()
                  setSendEmailType(PassStatus.PASSED)
                  setConfirmationDialogOpen(true)
                }}
                disabled={isDisabled(PassStatus.PASSED)}
              >
                <Send className='mr-2 h-4 w-4' />
                Send Acceptance Mails
              </Button>
            </TooltipTrigger>
            {isDisabled(PassStatus.PASSED) && <TooltipContent>{tooltipMessage} </TooltipContent>}
          </Tooltip>
        </div>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div className='space-y-0.5'>
            <Label>Manual Rejection Emails</Label>
            <p className='text-sm text-muted-foreground'>
              Send a rejection mail to ALL rejected students.
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Button
                className='w-full sm:w-auto'
                variant='outline'
                onClick={(e) => {
                  e.preventDefault()
                  setSendEmailType(PassStatus.FAILED)
                  setConfirmationDialogOpen(true)
                }}
                disabled={isDisabled(PassStatus.FAILED)}
              >
                <Send className='mr-2 h-4 w-4' />
                Send Rejection Mails
              </Button>
            </TooltipTrigger>
            {isDisabled(PassStatus.FAILED) && <TooltipContent>{tooltipMessage} </TooltipContent>}
          </Tooltip>
        </div>
        {confirmationDialogOpen && sendEmailType && (
          <ConfirmSendEmailDialog
            isOpen={confirmationDialogOpen}
            onClose={() => setConfirmationDialogOpen(false)}
            emailType={sendEmailType}
          />
        )}
      </TooltipProvider>
    </>
  )
}
