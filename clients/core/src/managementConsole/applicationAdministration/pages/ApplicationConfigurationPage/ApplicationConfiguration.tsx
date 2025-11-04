import { useState } from 'react'

import { Card, CardContent } from '@tumaet/prompt-ui-components'

import { ApplicationTimeline } from './components/ApplicationTimeline'
import { ApplicationConfigurationHeader } from './components/ConfigurationHeader'
import { ExternalStudentsStatus } from './components/ExternalStudentsAllowed'
import { ApplicationMetaData } from '../../interfaces/applicationMetaData'
import { getApplicationStatus } from '../../utils/getApplicationStatus'
import { ApplicationGeneralSettingsCard } from './components/ApplicationGeneralSettingsCard'
import { getIsApplicationConfigured } from '../../utils/getApplicationIsConfigured'
import { useParseApplicationMetaData } from '../../hooks/useParseApplicationMetaData'
import { useApplicationStore } from '../../zustand/useApplicationStore'

export const ApplicationConfiguration = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const { coursePhase } = useApplicationStore()

  useParseApplicationMetaData(coursePhase, setApplicationMetaData)

  const applicationPhaseIsConfigured = getIsApplicationConfigured(applicationMetaData)

  const applicationStatus = getApplicationStatus(applicationMetaData, applicationPhaseIsConfigured)

  return (
    <div className='container mx-auto space-y-8 flex flex-col items-center'>
      <h1 className='text-4xl font-bold text-center mb-8'>Application Configuration</h1>
      <Card className='max-w-4xl w-full'>
        <ApplicationConfigurationHeader
          applicationPhaseIsConfigured={applicationPhaseIsConfigured ?? false}
          applicationStatus={applicationStatus}
        />
        <CardContent className='space-y-6'>
          {applicationPhaseIsConfigured ? (
            <>
              <ApplicationTimeline
                startDate={applicationMetaData?.applicationStartDate}
                endDate={applicationMetaData?.applicationEndDate}
              />
              <ExternalStudentsStatus
                externalStudentsAllowed={applicationMetaData?.externalStudentsAllowed ?? false}
              />
            </>
          ) : (
            <div className='text-center py-8'>
              <p className='text-xl mb-4'>The application phase is not yet configured.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {applicationMetaData && <ApplicationGeneralSettingsCard initialData={applicationMetaData} />}
    </div>
  )
}
