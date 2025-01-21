import { CalendarX, Loader2, Mail } from 'lucide-react'
import { MissingConfig, MissingConfigItem } from '@/components/MissingConfig'
import { useGetCoursePhase } from './handlers/useGetCoursePhase'
import { getIsApplicationConfigured } from './utils/getApplicationIsConfigured'
import { useMemo, useState } from 'react'
import { ApplicationMetaData } from './interfaces/ApplicationMetaData'
import { useLocation } from 'react-router-dom'
import { useGetApplicationParticipations } from './handlers/useGetApplicationParticipations'
import { AssessmentDiagram } from './components/AssessmentDiagram'
import { ApplicationStatusCard } from './components/ApplicationStatusCard'
import { ApplicationGenderDiagram } from './components/ApplicationGenderDiagram'
import { ApplicationStudyBackgroundDiagram } from './components/ApplicationStudyBackgroundDiagram'
import { ErrorPage } from '@/components/ErrorPage'
import { ApplicationStudySemesterDiagram } from './components/ApplicationStudySemesterDiagram'
import { parseApplicationMailingMetaData } from './Mailing/utils/parseApplicaitonMailingMetaData'
import { getIsApplicationMailingIsConfigured } from './utils/getApplicationMailingIsConfigured'
import { ManagementPageHeader } from '../management/components/ManagementPageHeader'
import { useParseApplicationMetaData } from './handlers/useParseApplicationMetaData'

export const Application = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const path = useLocation().pathname
  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch: refetchCoursePhase,
  } = useGetCoursePhase()

  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    isError: isParticipantsError,
    refetch: refetchParticipations,
  } = useGetApplicationParticipations()

  const isPending = isCoursePhasePending || isParticipationsPending
  const isError = isCoursePhaseError || isParticipantsError
  const refetch = () => {
    refetchCoursePhase()
    refetchParticipations()
  }

  useParseApplicationMetaData(fetchedCoursePhase, setApplicationMetaData)

  const missingConfigs: MissingConfigItem[] = useMemo(() => {
    const missingConfigItems: MissingConfigItem[] = []
    if (!getIsApplicationConfigured(applicationMetaData)) {
      missingConfigItems.push({
        title: 'Application Phase Deadlines',
        icon: CalendarX,
        link: `${path}/configuration`,
      })
    }

    // TODO fix when mail is configured
    if (fetchedCoursePhase?.meta_data?.['mailingConfig'] === undefined) {
      missingConfigItems.push({
        title: 'Mail Configuration',
        icon: Mail,
        link: `${path}/mailing`,
      })
    } else {
      const mailingConfig = parseApplicationMailingMetaData(fetchedCoursePhase?.meta_data)
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
  }, [applicationMetaData, fetchedCoursePhase?.meta_data, path])

  return (
    <div>
      <ManagementPageHeader>Application Administration</ManagementPageHeader>
      {isPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : isError ? (
        <ErrorPage onRetry={refetch} />
      ) : (
        <>
          <MissingConfig elements={missingConfigs} />
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
            <ApplicationStatusCard
              applicationMetaData={applicationMetaData}
              applicationPhaseIsConfigured={getIsApplicationConfigured(applicationMetaData)}
            />
            <AssessmentDiagram applications={fetchedParticipations ?? []} />
            <ApplicationGenderDiagram applications={fetchedParticipations ?? []} />
          </div>
          <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6'>
            <ApplicationStudyBackgroundDiagram applications={fetchedParticipations ?? []} />
            <ApplicationStudySemesterDiagram applications={fetchedParticipations ?? []} />
          </div>
        </>
      )}
    </div>
  )
}
