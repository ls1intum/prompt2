import { useState } from 'react'

import React from 'react'

import ApplicationOverview from './components/Overview/ApplicationSettingsOverview'
import { ApplicationMetaData } from '../../interfaces/applicationMetaData'
import { getApplicationStatus } from '../../utils/getApplicationStatus'
import { ApplicationGeneralSettings } from './components/SettingsGeneral/ApplicationSettingsGeneral'
import { ApplicationSettingsCustomScores } from './components/SettingsCustomScores/ApplicationSettingsCustomScores'
import { getIsApplicationConfigured } from '../../utils/getApplicationIsConfigured'
import { useParseApplicationMetaData } from '../../hooks/useParseApplicationMetaData'
import { useApplicationStore } from '../../zustand/useApplicationStore'

export const ApplicationConfiguration = () => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const { coursePhase } = useApplicationStore()

  useParseApplicationMetaData(coursePhase, setApplicationMetaData)

  const applicationPhaseIsConfigured = getIsApplicationConfigured(applicationMetaData)

  const applicationStatus = getApplicationStatus(applicationMetaData, applicationPhaseIsConfigured)

  return (
    <div className='container space-y-8'>
      <h1 className='text-4xl font-bold mb-6'>Application Settings</h1>
      <ApplicationOverview
        applicationMetaData={applicationMetaData}
        applicationPhaseIsConfigured={applicationPhaseIsConfigured}
        applicationStatus={applicationStatus}
      />

      {applicationMetaData && <ApplicationGeneralSettings initialData={applicationMetaData} />}
      {applicationMetaData && <ApplicationSettingsCustomScores initialData={applicationMetaData} />}
    </div>
  )
}
