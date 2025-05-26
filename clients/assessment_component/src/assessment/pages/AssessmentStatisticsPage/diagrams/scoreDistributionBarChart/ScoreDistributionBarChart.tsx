import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Label,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from 'recharts'
import { ChartContainer } from '@tumaet/prompt-ui-components'

import { ScoreDistributionDataPoint } from './interfaces/ScoreDistributionDataPoint'

import { chartConfig } from '../utils/chartConfig'

import { ScoreDistributionTooltipContent } from './components/ScoreDistributionTooltipContent'
import { ScoreDistributionBar } from './components/ScoreDistributionBar'
import { ScoreDistributionLabel } from './components/ScoreDistributionLabel'

export interface ScoreDistributionBarChartProps {
  data: ScoreDistributionDataPoint[]
}

export function ScoreDistributionBarChart({ data }: ScoreDistributionBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <ChartContainer config={chartConfig} className='w-full h-[280px]'>
        <div className='flex items-center justify-center h-full text-muted'>No data available</div>
      </ChartContainer>
    )
  }

  const chartData = data.map((item) => ({
    name: item.shortLabel,
    value: 4, // Use the range as the value for sizing
    lowerQuartile: item.lowerQuartile,
    median: item.median,
    upperQuartile: item.upperQuartile,
    counts: item.counts,
    average: item.average,
  }))

  return (
    <ChartContainer config={chartConfig} className='w-full h-[280px]'>
      <BarChart data={chartData} margin={{ top: 30, right: 10, bottom: 10, left: 10 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          strokeDasharray='4 4'
          stroke='#e5e7eb'
          opacity={1}
        />

        <XAxis dataKey='name' axisLine={false} tickLine={false} interval={0} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#a3a3a3' }} // light grey ticks
          domain={[1, 4]}
          ticks={[1, 2, 3, 4]}
        >
          <Label value='Score Level' angle={-90} position='insideLeft' fill='#a3a3a3' />
        </YAxis>
        <ChartTooltip cursor={false} content={<ScoreDistributionTooltipContent />} />
        <Bar dataKey='value' shape={<ScoreDistributionBar />}>
          <LabelList dataKey='average' content={<ScoreDistributionLabel />} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
