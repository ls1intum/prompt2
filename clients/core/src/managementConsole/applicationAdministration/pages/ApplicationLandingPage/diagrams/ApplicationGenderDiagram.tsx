import React, { useMemo } from 'react'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { ApplicationParticipation } from '../../../interfaces/applicationParticipation'
import { Gender, getGenderString } from '@tumaet/prompt-shared-state'

const chartConfig: ChartConfig = {
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

interface GenderDistributionCardProps {
  applications: ApplicationParticipation[]
}

export const ApplicationGenderDiagram = ({
  applications,
}: GenderDistributionCardProps): JSX.Element => {
  const genderData = useMemo(() => {
    // Initialize counts for each gender
    const initialCounts: Record<Gender, { passed: number; failed: number; not_assessed: number }> =
      {
        [Gender.MALE]: { passed: 0, failed: 0, not_assessed: 0 },
        [Gender.FEMALE]: { passed: 0, failed: 0, not_assessed: 0 },
        [Gender.DIVERSE]: { passed: 0, failed: 0, not_assessed: 0 },
        [Gender.PREFER_NOT_TO_SAY]: { passed: 0, failed: 0, not_assessed: 0 },
      }

    // Aggregate counts by gender and passStatus
    const countsByGender = applications.reduce((acc, app) => {
      const gender: Gender = app.student.gender || Gender.PREFER_NOT_TO_SAY
      acc[gender][app.passStatus] += 1
      return acc
    }, initialCounts)

    // Map the counts to diagram data for the chart
    const diagramData = (Object.values(Gender) as Gender[]).map((gender) => {
      const accepted = countsByGender[gender]?.passed ?? 0
      const rejected = countsByGender[gender]?.failed ?? 0
      const notAssessed = countsByGender[gender]?.not_assessed ?? 0

      return {
        gender: gender !== Gender.PREFER_NOT_TO_SAY ? getGenderString(gender) : 'Unknown',
        accepted,
        rejected,
        notAssessed,
        total: accepted + rejected + notAssessed,
      }
    })

    return diagramData
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
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey='accepted' stackId='passStatus' fill={chartConfig.accepted.color} />
            <Bar dataKey='rejected' stackId='passStatus' fill={chartConfig.rejected.color} />
            <Bar dataKey='notAssessed' stackId='passStatus' fill={chartConfig.notAssessed.color}>
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
      </CardContent>
    </Card>
  )
}
