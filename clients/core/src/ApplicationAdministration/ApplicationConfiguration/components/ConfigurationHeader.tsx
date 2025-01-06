import { Badge } from '@/components/ui/badge'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { ApplicationStatus } from '../../interfaces/ApplicationStatus'

interface ApplicationConfigurationHeaderProps {
  applicationPhaseIsConfigured: boolean
  applicationStatus: string
}

export const ApplicationConfigurationHeader = ({
  applicationPhaseIsConfigured,
  applicationStatus,
}: ApplicationConfigurationHeaderProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ApplicationStatus.NotConfigured:
        return <AlertCircle className='h-5 w-5 text-yellow-500' />
      case ApplicationStatus.NotYetLive:
        return <Clock className='h-5 w-5 text-blue-500' />
      case ApplicationStatus.Live:
        return <CheckCircle2 className='h-5 w-5 text-green-500' />
      case ApplicationStatus.Passed:
        return <XCircle className='h-5 w-5 text-red-500' />
      default:
        return null
    }
  }

  return (
    <CardHeader>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <CardTitle className='text-2xl'>General Settings</CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={applicationPhaseIsConfigured ? 'default' : 'secondary'}
                className={`flex items-center space-x-1 ${
                  applicationStatus === 'Live'
                    ? 'bg-green-100 text-green-800'
                    : applicationStatus === 'Not Yet Live'
                      ? 'bg-blue-100 text-blue-800'
                      : applicationStatus === 'Passed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {getStatusIcon(applicationStatus)}
                <span>{applicationStatus}</span>
              </Badge>
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
