import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { Assessment } from '../../../interfaces/assessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'

interface AuthorDiagramProps {
  assessments: Assessment[]
}

export const AuthorDiagram = ({ assessments }: AuthorDiagramProps): JSX.Element => {
  const authorsMap = new Map<string, ScoreLevel[]>()
  assessments.forEach((ass) => {
    const author = ass.author ?? 'Unknown Author'

    if (ass.score !== undefined) {
      if (!authorsMap.has(author)) {
        authorsMap.set(author, [])
      }
      authorsMap.get(author)?.push(ass.score)
    }
  })

  const data = Array.from(authorsMap.entries()).map(([author, participations]) =>
    createScoreDistributionDataPoint(
      author
        .split(' ')
        .map((name) => name[0])
        .join(''),
      author,
      participations,
    ),
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
