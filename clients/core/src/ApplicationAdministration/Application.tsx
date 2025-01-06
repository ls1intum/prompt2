import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CalendarX, FileCheck, FileX, FileClock, Users, Mail } from 'lucide-react'
import { MissingConfig, MissingConfigItem } from '@/components/MissingConfig'
import { useGetCoursePhase } from './handlers/useGetCoursePhase'
import { getIsApplicationConfigured } from './utils/getApplicationIsConfigured'
import { useEffect, useMemo, useState } from 'react'
import { ApplicationMetaData } from './interfaces/ApplicationMetaData'
import { useLocation } from 'react-router-dom'
import { useGetApplicationParticipations } from './handlers/useGetApplicationParticipations'
import { AssessmentDiagram } from './components/AssessmentDiagram'
import { ApplicationStatusCard } from './components/ApplicationStatusCard'

export const Application = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const path = useLocation().pathname
  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    error: coursePhaseError,
    isError: isCoursePhaseError,
  } = useGetCoursePhase()

  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    isError: isParticipantsError,
    refetch: refetchParticipations,
  } = useGetApplicationParticipations()

  useEffect(() => {
    if (fetchedCoursePhase) {
      const externalStudentsAllowed = fetchedCoursePhase?.meta_data?.['externalStudentsAllowed']
      const applicationStartDate = fetchedCoursePhase?.meta_data?.['applicationStartDate']
      const applicationEndDate = fetchedCoursePhase?.meta_data?.['applicationEndDate']

      const parsedMetaData: ApplicationMetaData = {
        applicationStartDate: applicationStartDate ? new Date(applicationStartDate) : undefined,
        applicationEndDate: applicationEndDate ? new Date(applicationEndDate) : undefined,
        externalStudentsAllowed: externalStudentsAllowed ? externalStudentsAllowed : false,
      }
      setApplicationMetaData(parsedMetaData)
    }
  }, [fetchedCoursePhase])

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
    missingConfigItems.push({
      title: 'Mail Configuration',
      icon: Mail,
      link: `${path}`,
    })
    return missingConfigItems
  }, [applicationMetaData, path])

  const applicationStats = {
    total: 150,
    notAssessed: 50,
    accepted: 70,
    rejected: 30,
  }

  const applicationPhase = {
    isLive: true,
    daysLeft: 15,
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-4xl font-bold mb-6'>Application Administration</h1>
      <MissingConfig elements={missingConfigs} />

      {/* Application Statistics */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
        <ApplicationStatusCard
          applicationMetaData={applicationMetaData}
          applicationPhaseIsConfigured={getIsApplicationConfigured(applicationMetaData)}
        />
        <AssessmentDiagram applications={fetchedParticipations ?? []} />
      </div>
    </div>
  )
}
