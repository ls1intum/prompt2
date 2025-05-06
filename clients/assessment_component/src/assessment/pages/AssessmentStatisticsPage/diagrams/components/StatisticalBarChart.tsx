import { Bar, BarChart, LabelList, Rectangle, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip } from '@tumaet/prompt-ui-components'

import { StatisticalTooltipContent } from './StatisticalTooltipContent'
import { chartConfig } from '../utils/chartConfig'

// Get color based on average value
export function getBarColor(average: number): string {
  if (average < 1.5) {
    return 'var(--color-novice)' // Novice color
  } else if (average < 2.5) {
    return 'var(--color-intermediate)' // Intermediate color
  } else if (average < 3.5) {
    return 'var(--color-advanced)' // Advanced color
  } else {
    return 'var(--color-expert)' // Expert color
  }
}

export interface SkillCounts {
  novice: number
  intermediate: number
  advanced: number
  expert: number
}

export interface StatisticalDataPoint {
  name: string
  average: number
  lowerQuartile: number
  median: number
  upperQuartile: number
  counts: SkillCounts
}

interface StatisticalBarChartProps {
  data: StatisticalDataPoint[]
}

// Custom bar shape that includes quartile and median indicators
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props

  // Calculate positions for quartile and median indicators
  const lowerQuartileY = y + height * (1 - payload.lowerQuartile / 4)
  const medianY = y + height * (1 - payload.median / 4)
  const upperQuartileY = y + height * (1 - payload.upperQuartile / 4)

  // Get color based on average value
  const barColor = getBarColor(payload.average)

  return (
    <g>
      {/* Main bar */}
      <Rectangle x={x} y={y} width={width} height={height} fill={barColor} radius={[4, 4, 0, 0]} />

      {/* Lower quartile indicator */}
      <line
        x1={x}
        y1={lowerQuartileY}
        x2={x + width}
        y2={lowerQuartileY}
        stroke='#ffffff'
        strokeWidth={1}
        strokeOpacity={0.6}
      />

      {/* Median indicator */}
      <line
        x1={x}
        y1={medianY}
        x2={x + width}
        y2={medianY}
        stroke='#ffffff'
        strokeWidth={2}
        strokeOpacity={0.8}
      />

      {/* Upper quartile indicator */}
      <line
        x1={x}
        y1={upperQuartileY}
        x2={x + width}
        y2={upperQuartileY}
        stroke='#ffffff'
        strokeWidth={1}
        strokeOpacity={0.6}
      />
    </g>
  )
}

export function StatisticalBarChart({ data }: StatisticalBarChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.average,
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
        <YAxis hide domain={[0, 4]} />
        <ChartTooltip cursor={false} content={<StatisticalTooltipContent />} />
        <Bar dataKey='value' shape={<CustomBar />}>
          <LabelList
            dataKey='value'
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
