import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'
import { Switch } from '@/components/ui/switch'
import { ManualMailSending } from '@/components/pages/Mailing/components/ManualMailSending'
import { useGetMailingIsConfigured } from '../../../../hooks/useGetMailingIsConfigured'

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
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='sendConfirmationMail'>Automatic Confirmation Emails</Label>
                <p className='text-sm text-muted-foreground'>
                  Send confirmation emails automatically when a student applies.
                </p>
              </div>
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
