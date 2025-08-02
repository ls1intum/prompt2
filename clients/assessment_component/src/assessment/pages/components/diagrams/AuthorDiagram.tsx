import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { groupBy } from './utils/groupBy'

interface AuthorDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const AuthorDiagram = ({
  participationsWithAssessment,
}: AuthorDiagramProps): JSX.Element => {
  const chartData = Array.from(
    groupBy(
      participationsWithAssessment,
      (p) => p.assessmentCompletion?.author ?? 'Unknown Author',
    ),
  ).map(([author, participations]) =>
    createScoreDistributionDataPoint(
      author
        .split(' ')
        .map((name) => name[0])
        .join(''),
      author,
      participations.map((p) => p.scoreNumeric),
      participations.map((p) => p.scoreLevel),
    ),
  )

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Author Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ScoreDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
