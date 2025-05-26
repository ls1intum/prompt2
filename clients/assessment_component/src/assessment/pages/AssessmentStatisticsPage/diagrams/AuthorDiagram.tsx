import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'

interface AuthorDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const AuthorDiagram = ({
  participationsWithAssessment,
}: AuthorDiagramProps): JSX.Element => {
  const authorsMap = new Map<string, ScoreLevel[]>()
  participationsWithAssessment.forEach((p) => {
    const author = p.assessmentCompletion?.author ?? 'Unknown Author'

    if (p.scoreLevel !== undefined) {
      if (!authorsMap.has(author)) {
        authorsMap.set(author, [])
      }
      authorsMap.get(author)?.push(p.scoreLevel)
    }
  })

  const data = Array.from(authorsMap.entries()).map(([author, participations]) =>
    createScoreDistributionDataPoint(author, participations),
  )

  return (
    <Card className={`flex flex-col ${getGridSpanClass(authorsMap.size)}`}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Author Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ScoreDistributionBarChart data={data} />
      </CardContent>
    </Card>
  )
}
