import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@tumaet/prompt-ui-components'
import { BarChart, Bar, LabelList, XAxis, YAxis, Rectangle } from 'recharts'
import { chartConfig } from './utils/chartConfig'
import { getCornerRadius } from './utils/getCornerRadius'
import { DataPoint } from '../interfaces/DataPoint'

interface BarChartWithScoreLevelProps {
  data: DataPoint[]
}

const createRoundedBarShape = (segmentKey: string, stackKeys?: string[]) => {
  const RoundedBarShape = (props: any) => {
    const { x, y, width, height, payload } = props
    const radius = getCornerRadius(payload, segmentKey, stackKeys)
    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        radius={radius}
        fill={chartConfig[segmentKey]?.color}
      />
    )
  }
  RoundedBarShape.displayName = `RoundedBarShape(${segmentKey})`
  return RoundedBarShape
}

export const BarChartWithScoreLevel = ({ data }: BarChartWithScoreLevelProps) => {
  return (
    <ChartContainer config={chartConfig} className='mx-auto w-full h-[280px]'>
      <BarChart data={data} margin={{ top: 30, right: 10, bottom: 0, left: 10 }}>
        <XAxis
          dataKey='dataKey'
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          interval={0}
          height={50}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

        {['novice', 'intermediate', 'advanced', 'expert', 'notAssessed'].map((key) => (
          <Bar key={key} dataKey={key} shape={createRoundedBarShape(key)}>
            <LabelList
              dataKey={key}
              position='top'
              offset={10}
              className='fill-foreground'
              fontSize={12}
            />
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  )
}
