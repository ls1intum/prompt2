import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { ManualMailSending } from './ManualMailSending'
import { CoursePhaseMailingConfigData } from '@tumaet/prompt-shared-state'
import { Info } from 'lucide-react'

interface SettingsCardProps {
  mailingMetaData: CoursePhaseMailingConfigData
  isModified: boolean
}

export const SettingsCard = ({ mailingMetaData, isModified }: SettingsCardProps) => {
  const someMailFunctionDisabled =
    isModified ||
    !mailingMetaData?.passedMailContent ||
    !mailingMetaData?.passedMailSubject ||
    !mailingMetaData?.failedMailContent ||
    !mailingMetaData?.failedMailSubject

  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>E-Mail Settings</CardTitle>
            {isModified && (
              <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-300'>
                Unsaved Changes
              </Badge>
            )}
          </div>
          <CardDescription>Configure email settings for the application phase</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {someMailFunctionDisabled && (
            <div className='flex items-start space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-md'>
              <Info className='h-4 w-4 mt-0.5 flex-shrink-0' />
              <p>
                Some of the following mailing options are disabled. Please make sure to configure
                and save the corresponding mail subject and content.
              </p>
            </div>
          )}
          <div className='space-y-4'>
            <ManualMailSending mailingMetaData={mailingMetaData} isModified={isModified} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
