import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ApplicationMailingMetaData } from '@/interfaces/mailing_meta_data'
import { Switch } from '@/components/ui/switch'
import { ManualMailSending } from './ManualMailSending'

interface SettingsCardProps {
  applicationMailingMetaData: ApplicationMailingMetaData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSwitchChange: (key: string) => void
  isModified: boolean
  emailError: string | null
}

export const SettingsCard = ({
  applicationMailingMetaData,
  handleInputChange,
  handleSwitchChange,
  isModified,
  emailError,
}: SettingsCardProps): JSX.Element => {
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='replyToEmail'>Reply To Email</Label>
              <Input
                id='replyToEmail'
                type='email'
                name='replyToEmail'
                placeholder='i.e. course@management.de'
                value={applicationMailingMetaData.replyToEmail}
                onChange={handleInputChange}
              />
              {emailError && <p className='text-red-500 text-sm'>{emailError}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='replyToName'>Replier Name</Label>
              <Input
                id='replyToName'
                type='text'
                name='replyToName'
                placeholder='i.e. Course Management'
                value={applicationMailingMetaData.replyToName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Separator className='my-6' />

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
                checked={applicationMailingMetaData.sendConfirmationMail}
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
