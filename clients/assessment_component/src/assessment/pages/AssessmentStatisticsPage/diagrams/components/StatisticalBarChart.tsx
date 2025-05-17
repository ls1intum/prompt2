import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Label,
  Rectangle,
  Tooltip as ChartTooltip,
  CartesianGrid,
} from 'recharts'
import { ChartContainer } from '@tumaet/prompt-ui-components'
import { StatisticalDataPoint } from '../../interfaces/StatisticalDataPoint'

import { chartConfig, getBarColor } from '../utils/chartConfig'

import { StatisticalTooltipContent } from './StatisticalTooltipContent'

export interface StatisticalBarChartProps {
  data: StatisticalDataPoint[]
}

// Custom bar shape that shows a rectangle from lower quartile to upper quartile with median indicator
const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props

  // Calculate positions for quartile and median indicators
  const lowerQuartileY = y + height * (1 - (payload.lowerQuartile - 1) / 3)
  const upperQuartileY = y + height * (1 - (payload.upperQuartile - 1) / 3)
  const averageY = y + height * (1 - payload.average / 4)

  const barColor = getBarColor(payload.median)

  // Height of the rectangle is the difference between upper and lower quartile positions
  const minRectHeight = 8
  const rectHeight = Math.max(lowerQuartileY - upperQuartileY, minRectHeight)

  return (
    <g>
      <Rectangle
        x={x}
        y={upperQuartileY}
        width={width}
        height={rectHeight}
        fill={barColor}
        radius={[4, 4, 4, 4]}
      />

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
        <CartesianGrid
          horizontal={true}
          vertical={false}
          strokeDasharray='4 4'
          stroke='#e5e7eb' // light grey
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
          <Label value='Score Level' angle={-90} position='insideLeft' offset={10} fill='#a3a3a3' />
        </YAxis>
        <ChartTooltip cursor={false} content={<StatisticalTooltipContent />} />
        <Bar dataKey='value' shape={<CustomBar />}>
          <LabelList
            dataKey='average'
            position='top'
            formatter={(value: number) => value.toFixed(1)}
            offset={10}
            className='fill-[#a3a3a3]'
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
