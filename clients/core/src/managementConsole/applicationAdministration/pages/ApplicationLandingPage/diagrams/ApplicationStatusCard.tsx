import * as React from 'react'
import { differenceInDays, format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@tumaet/prompt-ui-components'
import { ApplicationStatusBadge } from '../../../components/ApplicationStatusBadge'
import { getApplicationStatus } from '../../../utils/getApplicationStatus'
import { ApplicationMetaData } from '../../../interfaces/applicationMetaData'
import { ApplicationStatus } from '../../../interfaces/applicationStatus'

interface ApplicationStatusCardProps {
  applicationMetaData: ApplicationMetaData | null
  applicationPhaseIsConfigured: boolean
}

export function ApplicationStatusCard({
  applicationMetaData,
  applicationPhaseIsConfigured,
}: ApplicationStatusCardProps) {
  const status = getApplicationStatus(applicationMetaData, applicationPhaseIsConfigured)
  const startDate = applicationMetaData?.applicationStartDate
  const endDate = applicationMetaData?.applicationEndDate

  const formatDate = (date: Date | null) => {
    return date ? format(date, 'MMM d, yyyy') : 'Not set'
  }

  const getDisplayContent = React.useMemo(() => {
    const now = new Date()
    switch (status) {
      case ApplicationStatus.NotYetLive:
        return startDate
          ? { days: differenceInDays(startDate, now), description: 'days until start' }
          : { days: null, description: 'Not set' }
      case ApplicationStatus.Live:
        return endDate
          ? { days: differenceInDays(endDate, now), description: 'days remaining' }
          : { days: null, description: 'Ongoing' }
      case ApplicationStatus.Passed:
        return { days: null, description: 'CLOSED' }
      default:
        return { days: null, description: 'Unknown' }
    }
  }, [status, startDate, endDate])

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-base font-medium'>Application Phase</CardTitle>
        <ApplicationStatusBadge
          applicationPhaseIsConfigured={applicationPhaseIsConfigured}
          applicationStatus={status}
        />
      </CardHeader>
      <CardContent className='flex-1 flex flex-col justify-between'>
        <div>
          {getDisplayContent.days !== null ? (
            <>
              <div className='text-6xl font-bold'>{getDisplayContent.days}</div>
              <div className='text-xl mt-1'>{getDisplayContent.description}</div>
            </>
          ) : (
            <div className='text-2xl font-bold'>{getDisplayContent.description}</div>
          )}
        </div>
        <div className='text-xs text-muted-foreground mt-4'>
          <p>{applicationPhaseIsConfigured ? 'Configured' : 'Not Configured'}</p>
          <p>Start: {formatDate(applicationMetaData?.applicationStartDate ?? null)}</p>
          <p>End: {formatDate(applicationMetaData?.applicationEndDate ?? null)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
