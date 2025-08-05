import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { GradeDistributionBarChart } from './gradeDistributionBarChart/GradeDistributionBarChart'
import { createGradeDistributionDataPoint } from './gradeDistributionBarChart/utils/createGradeDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { groupBy } from './utils/groupBy'

interface AuthorGradeDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const AuthorGradeDiagram = ({
  participationsWithAssessment,
}: AuthorGradeDiagramProps): JSX.Element => {
  const chartData = Array.from(
    groupBy(
      participationsWithAssessment,
      (p) => p.assessmentCompletion?.author ?? 'Unknown Author',
    ),
  ).map(([author, participations]) => {
    const grades = participations
      .map((p) => p.assessmentCompletion?.gradeSuggestion)
      .filter((grade): grade is number => grade !== undefined)

    return createGradeDistributionDataPoint(
      author
        .split(' ')
        .map((name) => name[0])
        .join(''),
      author,
      grades,
    )
  })

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Author Distribution</CardTitle>
        <CardDescription>Grades</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <GradeDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
