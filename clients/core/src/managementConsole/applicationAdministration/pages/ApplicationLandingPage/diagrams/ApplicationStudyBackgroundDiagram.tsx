import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { ApplicationParticipation } from '../../../interfaces/applicationParticipation'
import { useMemo } from 'react'
import translations from '@/lib/translations.json'

const programsWithOther = translations.university.studyPrograms.concat('Other')
const studyProgramsConfig = programsWithOther.reduce((acc, program) => {
  acc[program] = {
    label: translations.university.studyProgramShortNames[program] || program,
    color: 'hsl(var(--primary))',
  }
  return acc
}, {} as ChartConfig)

interface StudyBackgroundCardProps {
  applications: ApplicationParticipation[]
}

export const ApplicationStudyBackgroundDiagram = ({
  applications,
}: StudyBackgroundCardProps): JSX.Element => {
  const { studyData } = useMemo(() => {
    const studyPrograms = translations.university.studyPrograms

    const programCounts = applications.reduce(
      (acc, app) => {
        const program = studyPrograms.includes(app.student.studyProgram || '')
          ? app.student.studyProgram
          : 'Other'
        acc[program!] = (acc[program!] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const data = Object.entries(studyProgramsConfig).map(([program, config]) => ({
      program: config.label,
      fullName: program,
      Students: programCounts[program] || 0,
      fill: config.color,
    }))

    return { studyData: data }
  }, [applications])

  return (
    <Card className='flex flex-col w-full h-full'>
      <CardHeader className='items-center'>
        <CardTitle>Study Program Distribution</CardTitle>
        <CardDescription>Breakdown of student study programs</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col justify-end pb-0'>
        <ChartContainer config={studyProgramsConfig} className='mx-auto w-full h-[280px]'>
          <BarChart data={studyData} margin={{ top: 30, right: 10, bottom: 0, left: 10 }}>
            <XAxis
              dataKey='program'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              interval={0}
              height={50}
              tickFormatter={(value) => value.split(' ').join('\n')}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
            <Bar dataKey='Students' radius={[4, 4, 0, 0]}>
              {studyData.map((entry, index) => (
                <Bar key={`bar-${index}`} dataKey='Students' fill={entry.fill} />
              ))}
              <LabelList position='top' offset={10} className='fill-foreground' fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface CustomTooltipContentProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      fullName: string
      Students: number
    }
  }>
}

const CustomTooltipContent = ({ active, payload }: CustomTooltipContentProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className='bg-background border border-border rounded-lg shadow-md p-2'>
        <p className='font-semibold'>{data.fullName}</p>
        <p>Students: {data.Students}</p>
      </div>
    )
  }
  return null
}
