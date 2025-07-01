import * as React from 'react'
import { Label, Pie, PieChart } from 'recharts'

import { PassStatus } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@tumaet/prompt-ui-components'

import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'

const chartConfig = {
  assessments: {
    label: 'Assessments',
  },
  notAssessed: {
    label: 'Not Assessed',
    color: 'hsl(var(--muted))',
  },
  completed: {
    label: 'Completed waiting for acceptance',
    color: '#63B3ED', // Light blue
  },
  accepted: {
    label: 'Accepted',
    color: 'hsl(var(--success))',
  },
  rejected: {
    label: 'Rejected',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig

interface AssessmentDiagramProps {
  participations: AssessmentParticipationWithStudent[]
  scoreLevels: ScoreLevelWithParticipation[]
}

export const AssessmentDiagram = ({
  participations,
  scoreLevels,
}: AssessmentDiagramProps): JSX.Element => {
  const { chartData, totalAssessments } = React.useMemo(() => {
    const accepted = participations.filter((app) => app.passStatus === PassStatus.PASSED).length
    const rejected = participations.filter((app) => app.passStatus === PassStatus.FAILED).length
    const notAssessed = participations.length - scoreLevels.length
    const completed = Math.max(0, participations.length - notAssessed - accepted - rejected)

    return {
      chartData: [
        { status: 'notAssessed', applications: notAssessed, fill: chartConfig.notAssessed.color },
        { status: 'accepted', applications: accepted, fill: chartConfig.accepted.color },
        { status: 'rejected', applications: rejected, fill: chartConfig.rejected.color },
        { status: 'completed', applications: completed, fill: chartConfig.completed.color },
      ],
      totalAssessments: participations.length,
    }
  }, [participations, scoreLevels])

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Assessments</CardTitle>
        <CardDescription>All assessments and their status</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[250px]'>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey='applications'
              nameKey='status'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalAssessments.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Assessments
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
