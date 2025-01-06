import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { Gender } from '@/interfaces/gender'
import { useMemo } from 'react'

const chartConfig = {
  female: {
    label: 'Female',
    color: 'hsl(var(--chart-blue))',
  },
  male: {
    label: 'Male',
    color: 'hsl(var(--chart-blue))',
  },
  diverse: {
    label: 'Diverse',
    color: 'hsl(var(--chart-blue))',
  },
  prefer_not_to_say: {
    label: 'Unknown',
    color: 'hsl(var(--chart-blue))',
  },
} satisfies ChartConfig

interface GenderDistributionCardProps {
  applications: ApplicationParticipation[]
}

export const ApplicationGenderDiagram = ({
  applications,
}: GenderDistributionCardProps): JSX.Element => {
  const { genderData } = useMemo(() => {
    const genderCounts = applications.reduce(
      (acc, app) => {
        const gender = app.student.gender || 'prefer_not_to_say'
        acc[gender] = (acc[gender] || 0) + 1
        return acc
      },
      {} as Record<Gender, number>,
    )

    const data = Object.entries(chartConfig).map(([gender, config]) => ({
      gender: config.label,
      students: genderCounts[gender as Gender] || 0,
      fill: config.color,
    }))

    return { genderData: data }
  }, [applications])

  return (
    <Card className='flex flex-col w-full h-full'>
      <CardHeader className='items-center'>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Breakdown of student genders</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col justify-end pb-0'>
        <ChartContainer config={chartConfig} className='mx-auto w-full h-[280px]'>
          <BarChart data={genderData} margin={{ top: 30, right: 10, bottom: 0, left: 10 }}>
            <XAxis
              dataKey='gender'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              interval={0}
              height={50}
              tickFormatter={(value) => value.split(' ').join('\n')}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='students' radius={[4, 4, 0, 0]}>
              {genderData.map((entry, index) => (
                <Bar key={`bar-${index}`} dataKey='students' fill={entry.fill} />
              ))}
              <LabelList position='top' offset={10} className='fill-foreground' fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
