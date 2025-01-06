import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CalendarX, FileCheck, FileX, FileClock, Users, Mail } from 'lucide-react'
import { MissingConfig, MissingConfigItem } from '@/components/MissingConfig'
import { useGetCoursePhase } from './handlers/useGetCoursePhase'
import { getIsApplicationConfigured } from './utils/getApplicationIsConfigured'
import { useEffect, useMemo, useState } from 'react'
import { ApplicationMetaData } from './interfaces/ApplicationMetaData'
import { useLocation } from 'react-router-dom'

export const Application = (): JSX.Element => {
  const [applicationMetaData, setApplicationMetaData] = useState<ApplicationMetaData | null>(null)
  const path = useLocation().pathname
  const {
    data: fetchedCoursePhase,
    isPending: isCoursePhasePending,
    error: coursePhaseError,
    isError: isCoursePhaseError,
  } = useGetCoursePhase()

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
    if (getIsApplicationConfigured(applicationMetaData)) {
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
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Applications</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{applicationStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Not Assessed</CardTitle>
            <FileClock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{applicationStats.notAssessed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Accepted</CardTitle>
            <FileCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{applicationStats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
            <FileX className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{applicationStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Application Phase Status */}
      <Card>
        <CardHeader>
          <CardTitle>Application Phase Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>Status:</span>
              <span
                className={`font-bold ${applicationPhase.isLive ? 'text-green-500' : 'text-red-500'}`}
              >
                {applicationPhase.isLive ? 'LIVE' : 'CLOSED'}
              </span>
            </div>
            {applicationPhase.isLive && (
              <>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Days Left:</span>
                  <span className='font-bold'>{applicationPhase.daysLeft}</span>
                </div>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span className='text-sm font-medium'>Application Period Progress</span>
                    <span className='text-sm font-medium'>
                      {Math.round((1 - applicationPhase.daysLeft / 30) * 100)}%
                    </span>
                  </div>
                  <Progress value={(1 - applicationPhase.daysLeft / 30) * 100} className='w-full' />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
