import { TeamAllocationTimeframeSettings } from './components/TeamAllocationTimeframeSettings'
import { Timeframe } from '../../interfaces/timeframe'
import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getTimeframe } from '../../network/queries/getSurveyTimeframe'
import { useParams } from 'react-router-dom'

export const SettingsPage = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const {
    data: timeframe,
    isPending: isTimeframePending,
    isError: isTimeframeError,
    refetch: refetchTimeframe,
  } = useQuery<Timeframe>({
    queryKey: ['timeframe', phaseId],
    queryFn: () => getTimeframe(phaseId ?? ''),
  })

  if (isTimeframePending) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='animate-spin' />
      </div>
    )
  }

  if (isTimeframeError) {
    return <ErrorPage onRetry={refetchTimeframe} />
  }

  return (
    <div>
      <ManagementPageHeader>Settings</ManagementPageHeader>
      <TeamAllocationTimeframeSettings teamAllocationTimeframe={timeframe} />
    </div>
  )
}
