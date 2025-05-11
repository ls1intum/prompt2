import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { StatisticalBarChart } from './components/StatisticalBarChart'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { createStatisticalDataPoint } from './utils/createStatisticalDataPoint'

interface AuthorDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const AuthorDiagram = ({
  participationsWithAssessment,
}: AuthorDiagramProps): JSX.Element => {
  const authorsMap = new Map<string, ScoreLevel[]>()
  participationsWithAssessment.forEach((p) => {
    const author = p.assessmentCompletion?.author ?? 'Unknown Author'
    if (!authorsMap.has(author)) {
      authorsMap.set(author, [])
    }
    if (p.scoreLevel !== undefined) {
      authorsMap.get(author)?.push(p.scoreLevel)
    }
  })

  const data = Array.from(authorsMap.entries()).map(([author, participations]) =>
    createStatisticalDataPoint(author, participations),
  )

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Author Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <StatisticalBarChart data={data} />
      </CardContent>
    </Card>
  )
}
