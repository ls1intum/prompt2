import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Label,
  Rectangle,
  Tooltip as ChartTooltip,
} from 'recharts'
import { ChartContainer } from '@tumaet/prompt-ui-components'
import { StatisticalTooltipContent } from './StatisticalTooltipContent'
import { chartConfig } from '../utils/chartConfig'
import { StatisticalDataPoint } from '../../interfaces/StatisticalDataPoint'
import { ScoreLevel } from '../../../../interfaces/scoreLevel'

export interface StatisticalBarChartProps {
  data: StatisticalDataPoint[]
}

export function getBarColor(scoreLevel: ScoreLevel): string {
  switch (scoreLevel) {
    case ScoreLevel.Novice:
      return 'var(--color-novice)' // Novice color
    case ScoreLevel.Intermediate:
      return 'var(--color-intermediate)' // Intermediate color
    case ScoreLevel.Advanced:
      return 'var(--color-advanced)' // Advanced color
    case ScoreLevel.Expert:
      return 'var(--color-expert)' // Expert color
    default:
      return 'var(--color-default)' // Default color
  }
}

// Custom bar shape that shows a rectangle from lower quartile to upper quartile with median indicator
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props

  // Calculate positions for quartile and median indicators
  const lowerQuartileY = y + height * (1 - payload.lowerQuartile / 4)
  const upperQuartileY = y + height * (1 - payload.upperQuartile / 4)
  const averageY = y + height * (1 - payload.average / 4)

  // Get color based on average value
  const barColor = getBarColor(payload.median)

  // Height of the rectangle is the difference between upper and lower quartile positions
  const rectHeight = lowerQuartileY - upperQuartileY

  return (
    <g>
      {/* Rectangle from lower quartile to upper quartile */}
      <Rectangle
        x={x}
        y={upperQuartileY}
        width={width}
        height={rectHeight}
        fill={barColor}
        radius={[4, 4, 4, 4]}
      />

      {/* Median indicator */}
      <line
        x1={x}
        y1={averageY}
        x2={x + width}
        y2={averageY}
        stroke='#ffffff'
        strokeWidth={2}
        strokeOpacity={0.8}
      />
    </g>
  )
}

export function StatisticalBarChart({ data }: StatisticalBarChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.name,
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
        <XAxis
          dataKey='name'
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 4]}>
          <Label value='Score Level' angle={-90} position='insideLeft' offset={10} />
        </YAxis>
        <ChartTooltip cursor={false} content={<StatisticalTooltipContent />} />
        <Bar dataKey='value' shape={<CustomBar />}>
          <LabelList
            dataKey='average'
            position='top'
            formatter={(value: number) => value.toFixed(1)}
            offset={10}
            className='fill-foreground'
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
