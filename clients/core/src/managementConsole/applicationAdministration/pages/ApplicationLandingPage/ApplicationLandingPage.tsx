import { MissingConfig } from '@/components/MissingConfig'
import { getIsApplicationConfigured } from '../../utils/getApplicationIsConfigured'
import { useState } from 'react'
import { ApplicationMetaData } from '../../interfaces/applicationMetaData'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useParseApplicationMetaData } from '../../hooks/useParseApplicationMetaData'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { useLocation } from 'react-router-dom'
import { useMissingConfigs } from './hooks/useMissingConfig'
import { useHideMailingWarning } from './hooks/useHideMailingWarning'
import { ApplicationDashboard } from './components/ApplicationDashboard'

export const ApplicationLandingPage = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const { pathname } = useLocation()
  const { coursePhase, participations } = useApplicationStore()
  const { hideMailingWarning } = useHideMailingWarning()
  const missingConfigs = useMissingConfigs(
    applicationMetaData,
    coursePhase,
    pathname,
    hideMailingWarning,
  )

  useParseApplicationMetaData(coursePhase, setApplicationMetaData)
  const acceptedApplications = participations.filter((app) => app.passStatus === PassStatus.PASSED)

  const isApplicationConfigured = getIsApplicationConfigured(applicationMetaData)

  return (
    <div>
      <Tabs defaultValue='all' className='mb-6'>
        <div className='flex flex-col sm:flex-row sm:justify-between mb-6'>
          <ManagementPageHeader>Application Administration</ManagementPageHeader>
          <TabsList className='inline-flex items-end mt-4 sm:mt-0 w-fit'>
            <TabsTrigger value='all'>All Applications</TabsTrigger>
            <TabsTrigger value='accepted'>Accepted Applications</TabsTrigger>
          </TabsList>
        </div>
        <MissingConfig elements={missingConfigs} />

        <TabsContent value='all'>
          <ApplicationDashboard
            applications={participations}
            applicationMetaData={applicationMetaData}
            isApplicationConfigured={isApplicationConfigured}
          />
        </TabsContent>

        <TabsContent value='accepted'>
          <ApplicationDashboard
            applications={acceptedApplications}
            applicationMetaData={applicationMetaData}
            isApplicationConfigured={isApplicationConfigured}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
