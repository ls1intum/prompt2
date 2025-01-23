import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ManualMailSending } from './ManualMailSending'
import { CoursePhaseMailingConfigData } from '@/interfaces/coursePhaseMailingConfigData'
// import { useGetMailingIsConfigured } from '../../../../hooks/useGetMailingIsConfigured'

interface SettingsCardProps {
  mailingMetaData: CoursePhaseMailingConfigData
  isModified: boolean
}

export const SettingsCard = ({ mailingMetaData, isModified }: SettingsCardProps): JSX.Element => {
  // TODO: AFTER shared library!!!
  //   const courseMailingIsConfigured = useGetMailingIsConfigured()
  //   const automaticConfirmationMailEnabled =
  //     courseMailingIsConfigured &&
  //     applicationMailingMetaData.confirmationMailContent !== '' &&
  //     applicationMailingMetaData.confirmationMailSubject !== ''

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
            <ManualMailSending mailingMetaData={mailingMetaData} isModified={isModified} />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
