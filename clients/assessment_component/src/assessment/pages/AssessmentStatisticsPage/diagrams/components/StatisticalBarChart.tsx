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
import { mapNumberToScoreLevel, ScoreLevel } from '../../../../interfaces/scoreLevel'

export interface StatisticalBarChartProps {
  data: StatisticalDataPoint[]
}

const CustomBar = (props: any) => {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props

  const scale = height / (Object.keys(ScoreLevel).length - 1)
  const lowerQuartileY = y + height - (payload.lowerQuartile - 1) * scale
  const upperQuartileY = y + height - (payload.upperQuartile - 1) * scale
  const averageY = y + height - (payload.average - 1) * scale

  const barColor = getBarColor(mapNumberToScoreLevel(payload.average))

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
          stroke='#e5e7eb'
          opacity={1}
        />

        <XAxis
          dataKey='name'
          axisLine={false}
          tickLine={false}
          interval={0}
          height={80}
          tick={({ x, y, payload }) => {
            const lines = String(payload.value).split(' ')
            return (
              <text
                x={x}
                y={y + 10}
                textAnchor='start'
                fontSize={12}
                fill='#a3a3a3'
                transform={`rotate(90, ${x}, ${y + 10})`}
              >
                {lines.map((line, i) => (
                  <tspan x={x} dy={i === 0 ? 0 : 14} key={i}>
                    {line}
                  </tspan>
                ))}
              </text>
            )
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#a3a3a3' }} // light grey ticks
          domain={[1, 4]}
          ticks={[1, 2, 3, 4]}
        >
          <Label value='Score Level' angle={-90} position='insideLeft' fill='#a3a3a3' />
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
