import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { ApplicationMailingMetaData } from '../../../interfaces/applicationMailingMetaData'
import { Switch } from '@/components/ui/switch'
import { ManualMailSending } from '@/components/pages/Mailing/components/ManualMailSending'
import { useGetMailingIsConfigured } from '@/hooks/useGetMailingIsConfigured'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SettingsCardProps {
  applicationMailingMetaData: ApplicationMailingMetaData
  handleSwitchChange: (key: string) => void
  isModified: boolean
}

export const SettingsCard = ({
  applicationMailingMetaData,
  handleSwitchChange,
  isModified,
}: SettingsCardProps): JSX.Element => {
  const courseMailingIsConfigured = useGetMailingIsConfigured()
  const automaticConfirmationMailEnabled =
    courseMailingIsConfigured &&
    applicationMailingMetaData.confirmationMailContent !== '' &&
    applicationMailingMetaData.confirmationMailSubject !== ''

  const someMailFunctionDisabled =
    !automaticConfirmationMailEnabled ||
    !courseMailingIsConfigured ||
    !applicationMailingMetaData?.passedMailContent ||
    !applicationMailingMetaData?.passedMailSubject ||
    !applicationMailingMetaData?.failedMailContent ||
    !applicationMailingMetaData?.failedMailSubject

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
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='sendConfirmationMail'>Automatic Confirmation Emails</Label>
                <p className='text-sm text-muted-foreground'>
                  Send confirmation emails automatically when a student applies.
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch
                        id='sendConfirmationMail'
                        disabled={!automaticConfirmationMailEnabled}
                        checked={
                          automaticConfirmationMailEnabled
                            ? applicationMailingMetaData.sendConfirmationMail
                            : false
                        }
                        onCheckedChange={() => handleSwitchChange('sendConfirmationMail')}
                      />
                    </div>
                  </TooltipTrigger>
                  {!automaticConfirmationMailEnabled && (
                    <TooltipContent>
                      Confirmation mail subject or content is missing.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            <ManualMailSending
              mailingMetaData={applicationMailingMetaData}
              isModified={isModified}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
