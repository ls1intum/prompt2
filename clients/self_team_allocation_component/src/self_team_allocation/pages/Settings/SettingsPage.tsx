import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { TeamAllocationTimeframeSettings } from './components/TeamAllocationTimeframeSettings'
import { Timeframe } from '../../interfaces/timeframe'

export const SettingsPage = () => {
  const mockData: Timeframe = {
    timeframeSet: true,
    startTime: new Date('2025-04-01T00:00:00Z'),
    endTime: new Date('2025-05-31T23:59:59Z'),
  }
  return (
    <div>
      <ManagementPageHeader>Settings</ManagementPageHeader>
      <TeamAllocationTimeframeSettings teamAllocationTimeframe={mockData} />
    </div>
  )
}
