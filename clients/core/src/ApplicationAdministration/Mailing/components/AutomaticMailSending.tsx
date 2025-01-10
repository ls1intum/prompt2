import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'
import { Info } from 'lucide-react'

interface AutomaticMailSendingProps {
  mailingMetaData: ApplicationMailingMetaData
  onChange: (key: string) => void
}

export const AutomaticMailSending = ({
  mailingMetaData,
  onChange,
}: AutomaticMailSendingProps): JSX.Element => {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-medium'>Automatic Email Sending</h3>
      <p className='text-sm text-gray-500'>
        Configure which emails should be sent automatically when changing the application status.
      </p>
      <div className='flex items-center justify-between'>
        <Label htmlFor='sendConfirmationMail'>Application Confirmation Email</Label>
        <Switch
          id='sendConfirmationMail'
          checked={mailingMetaData.sendConfirmationMail}
          onCheckedChange={() => onChange('sendConfirmationMail')}
        />
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Label htmlFor='sendRejectionMail'>Acceptance Email</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={(e) => e.preventDefault()}>
                <Info className='h-4 w-4 text-gray-500' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs text-sm'>
                  When enabled, the student will automatically receive a rejection email when their
                  application status is set to accepted.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id='sendAcceptanceMail'
          disabled={true}
          checked={mailingMetaData.sendAcceptanceMail}
          onCheckedChange={() => onChange('sendRejectionMail')}
        />
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Label htmlFor='sendRejectionMail'>Rejection Email</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={(e) => e.preventDefault()}>
                <Info className='h-4 w-4 text-gray-500' />
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs text-sm'>
                  When enabled, the student will automatically receive a rejection email when their
                  application status is set to rejected.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id='sendRejectionMail'
          disabled={true}
          checked={mailingMetaData.sendRejectionMail}
          onCheckedChange={() => onChange('sendRejectionMail')}
        />
      </div>
    </div>
  )
}
