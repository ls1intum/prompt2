import { CalendarX, Mail } from 'lucide-react'
import { MissingConfig, MissingConfigItem } from '@/components/MissingConfig'
import { getIsApplicationConfigured } from '../../utils/getApplicationIsConfigured'
import { useMemo, useState } from 'react'
import { ApplicationMetaData } from '../../interfaces/ApplicationMetaData'
import { useLocation } from 'react-router-dom'
import { AssessmentDiagram } from './diagrams/AssessmentDiagram'
import { ApplicationStatusCard } from './diagrams/ApplicationStatusCard'
import { ApplicationGenderDiagram } from './diagrams/ApplicationGenderDiagram'
import { ApplicationStudyBackgroundDiagram } from './diagrams/ApplicationStudyBackgroundDiagram'
import { ApplicationStudySemesterDiagram } from './diagrams/ApplicationStudySemesterDiagram'
import { parseApplicationMailingMetaData } from '../Mailing/utils/parseApplicaitonMailingMetaData'
import { getIsApplicationMailingIsConfigured } from '../../utils/getApplicationMailingIsConfigured'
import { ManagementPageHeader } from '../../../management/components/ManagementPageHeader'
import { useParseApplicationMetaData } from '../../hooks/useParseApplicationMetaData'
import { useApplicationStore } from '../../zustand/useApplicationStore'

export const ApplicationLandingPage = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const path = useLocation().pathname
  const { coursePhase, participations } = useApplicationStore()

  useParseApplicationMetaData(coursePhase, setApplicationMetaData)

  const missingConfigs: MissingConfigItem[] = useMemo(() => {
    const missingConfigItems: MissingConfigItem[] = []
    if (!getIsApplicationConfigured(applicationMetaData)) {
      missingConfigItems.push({
        title: 'Application Phase Deadlines',
        icon: CalendarX,
        link: `${path}/configuration`,
      })
    }

    if (coursePhase?.meta_data?.['mailingConfig'] === undefined) {
      missingConfigItems.push({
        title: 'Mail Configuration',
        icon: Mail,
        link: `${path}/mailing`,
      })
    } else {
      const mailingConfig = parseApplicationMailingMetaData(coursePhase?.meta_data)
      if (
        // trying to send mails but reply to not set
        !getIsApplicationMailingIsConfigured(mailingConfig) &&
        (mailingConfig.sendAcceptanceMail ||
          mailingConfig.sendConfirmationMail ||
          mailingConfig.sendRejectionMail)
      ) {
        missingConfigItems.push({
          title: 'Mail Replier Information',
          icon: Mail,
          link: `${path}/mailing`,
        })
      }
    }
    return missingConfigItems
  }, [applicationMetaData, coursePhase?.meta_data, path])

  return (
    <div>
      <ManagementPageHeader>Application Administration</ManagementPageHeader>

      <>
        <MissingConfig elements={missingConfigs} />
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
          <ApplicationStatusCard
            applicationMetaData={applicationMetaData}
            applicationPhaseIsConfigured={getIsApplicationConfigured(applicationMetaData)}
          />
          <AssessmentDiagram applications={participations ?? []} />
          <ApplicationGenderDiagram applications={participations ?? []} />
        </div>
        <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6'>
          <ApplicationStudyBackgroundDiagram applications={participations ?? []} />
          <ApplicationStudySemesterDiagram applications={participations ?? []} />
        </div>
      </>
    </div>
  )
}
