import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, LabelList, XAxis, YAxis } from 'recharts'
import { chartConfig } from './utils/chartConfig'
import { getCornerRadius } from './utils/getCornerRadius'

interface StackedBarChartWithPassStatusProps {
  data: any[]
  dataKey: string
}

export const StackedBarChartWithPassStatus = ({
  data,
  dataKey,
}: StackedBarChartWithPassStatusProps) => {
  const [radiusAccepted, radiusRejected, radiusNotAssessed] = getCornerRadius(data)

  return (
    <ChartContainer config={chartConfig} className='mx-auto w-full h-[280px]'>
      <BarChart data={data} margin={{ top: 30, right: 10, bottom: 0, left: 10 }}>
        <XAxis
          dataKey={dataKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          interval={0}
          height={50}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <YAxis hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey='accepted'
          stackId='passStatus'
          fill={chartConfig.accepted.color}
          radius={radiusAccepted}
        />
        <Bar
          dataKey='rejected'
          stackId='passStatus'
          fill={chartConfig.rejected.color}
          radius={radiusRejected}
        />
        <Bar
          dataKey='notAssessed'
          stackId='passStatus'
          fill={chartConfig.notAssessed.color}
          radius={radiusNotAssessed}
        >
          <LabelList
            dataKey='total'
            position='top'
            offset={10}
            className='fill-foreground'
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
