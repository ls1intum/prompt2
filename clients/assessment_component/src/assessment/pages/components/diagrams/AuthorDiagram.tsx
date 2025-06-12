import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

interface AuthorDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const AuthorDiagram = ({
  participationsWithAssessment,
}: AuthorDiagramProps): JSX.Element => {
  const authorsMap = new Map<string, { scores: ScoreLevel[]; scoreLevels: ScoreLevel[] }>()
  participationsWithAssessment.forEach((p) => {
    if (p.assessmentCompletion?.author !== undefined) {
      const author = p.assessmentCompletion?.author ?? 'Unknown Author'

      if (p.scoreLevel !== undefined) {
        if (!authorsMap.has(author)) {
          authorsMap.set(author, { scores: [], scoreLevels: [] })
        }
        authorsMap.get(author)?.scores.push(...p.assessments.map((a) => a.scoreLevel))
        authorsMap.get(author)?.scoreLevels.push(p.scoreLevel)
      }
    } else {
      p.assessments.forEach((assessment) => {
        const author = assessment.author ?? 'Unknown Author'

        if (!authorsMap.has(author)) {
          authorsMap.set(author, { scores: [], scoreLevels: [] })
        }
        authorsMap.get(author)?.scores.push(assessment.scoreLevel)
      })
    }
  })

  const data = Array.from(authorsMap.entries()).map(([author, participations]) =>
    createScoreDistributionDataPoint(
      author
        .split(' ')
        .map((name) => name[0])
        .join(''),
      author,
      participations.scores,
      participations.scoreLevels,
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
