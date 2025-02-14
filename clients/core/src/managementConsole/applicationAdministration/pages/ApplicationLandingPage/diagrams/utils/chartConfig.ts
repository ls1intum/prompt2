import { ChartConfig } from '@/components/ui/chart'

export const chartConfig: ChartConfig = {
  notAssessed: {
    label: 'Not Assessed',
    color: 'hsl(var(--muted))',
  },
  accepted: {
    label: 'Accepted',
    color: 'hsl(var(--success))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--destructive))',
  },
}
