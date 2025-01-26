import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ApplicationStatusBadge } from '../../../components/ApplicationStatusBadge'

interface ApplicationConfigurationHeaderProps {
  applicationPhaseIsConfigured: boolean
  applicationStatus: string
}

export const ApplicationConfigurationHeader = ({
  applicationPhaseIsConfigured,
  applicationStatus,
}: ApplicationConfigurationHeaderProps) => {
  return (
    <CardHeader>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <CardTitle className='text-2xl'>General Settings</CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ApplicationStatusBadge
                applicationPhaseIsConfigured={applicationPhaseIsConfigured}
                applicationStatus={applicationStatus}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Current status of the application phase</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CardDescription>
        {applicationPhaseIsConfigured
          ? 'Application phase is configured. You can modify the settings below.'
          : 'Configure the application phase for this course.'}
      </CardDescription>
    </CardHeader>
  )
}
