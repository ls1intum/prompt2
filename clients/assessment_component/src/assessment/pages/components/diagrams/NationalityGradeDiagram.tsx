import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { getCountryName } from '@/lib/getCountries'

import { GradeDistributionBarChart } from './gradeDistributionBarChart/GradeDistributionBarChart'

import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { createGradeDistributionDataPoint } from './gradeDistributionBarChart/utils/createGradeDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { groupBy } from './utils/groupBy'

interface NationalityGradeDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const NationalityGradeDiagram = ({
  participationsWithAssessment,
}: NationalityGradeDiagramProps): JSX.Element => {
  const chartData = Array.from(
    groupBy(participationsWithAssessment, (p) => p.participation.student.nationality || 'Unknown'),
  ).map(([nationality, participations]) => {
    const grades = participations
      .map((p) => p.assessmentCompletion?.gradeSuggestion)
      .filter((grade): grade is number => grade !== undefined)

    return createGradeDistributionDataPoint(
      nationality,
      getCountryName(nationality) ?? 'Unknown',
      grades,
    )
  })

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center'>
        <CardTitle>Nationality Distribution</CardTitle>
        <CardDescription>Grades</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <GradeDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
