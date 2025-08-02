import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@tumaet/prompt-ui-components'
import { BarChart, Bar, LabelList, XAxis, YAxis, Cell } from 'recharts'

interface GradeDataPoint {
  dataKey: string
  count: number
  total: number
}

interface BarChartWithGradesProps {
  data: GradeDataPoint[]
}

// Grade-specific chart configuration
const gradeChartConfig = {
  '1.0': {
    label: '1.0',
    color: '#60a5fa', // blue-400 (lighter variant of Very Good)
  },
  '1.3': {
    label: '1.3',
    color: '#93c5fd', // blue-300 (original Very Good color)
  },
  '1.7': {
    label: '1.7',
    color: '#4ade80', // green-400 (lighter variant of Good)
  },
  '2.0': {
    label: '2.0',
    color: '#86efac', // green-300 (original Good color)
  },
  '2.3': {
    label: '2.3',
    color: '#bbf7d0', // green-200 (lightest variant of Good)
  },
  '2.7': {
    label: '2.7',
    color: '#fef08a', // yellow-200 (lighter variant of Ok)
  },
  '3.0': {
    label: '3.0',
    color: '#fde68a', // yellow-300 (original Ok color)
  },
  '3.3': {
    label: '3.3',
    color: '#fcd34d', // yellow-400 (darker variant of Ok)
  },
  '3.7': {
    label: '3.7',
    color: '#fb923c', // orange-400 (lighter variant of Bad)
  },
  '4.0': {
    label: '4.0',
    color: '#f97316', // orange-500 (original Bad color)
  },
  '5.0': {
    label: '5.0',
    color: '#fca5a5', // red-300 (original Very Bad color)
  },
  'No Grade': {
    label: 'No Grade',
    color: '#d4d4d8', // gray-300
  },
}

const getColorForGrade = (grade: string): string => {
  return gradeChartConfig[grade as keyof typeof gradeChartConfig]?.color || '#d4d4d8'
}

export const BarChartWithGrades = ({ data }: BarChartWithGradesProps) => {
  return (
    <ChartContainer config={gradeChartConfig} className='mx-auto w-full h-[280px]'>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis
          dataKey='dataKey'
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          interval={0}
          height={60}
          angle={-45}
          textAnchor='end'
        />
        <YAxis hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          labelFormatter={(label) => `Grade: ${label}`}
          formatter={(value) => [value, 'Students']}
        />
        <Bar dataKey='count' radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColorForGrade(entry.dataKey)} />
          ))}
          <LabelList
            dataKey='count'
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
