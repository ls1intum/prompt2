import { useMemo } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreLevel } from '../../../interfaces/scoreLevel'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'

import { BarChartWithScoreLevel } from './BarChartWithScoreLevel'

interface AssessmentScoreLevelDiagramProps {
  participations: AssessmentParticipationWithStudent[]
  scoreLevels: ScoreLevelWithParticipation[]
}

export const AssessmentScoreLevelDiagram = ({
  participations,
  scoreLevels,
}: AssessmentScoreLevelDiagramProps): JSX.Element => {
  const chartData = useMemo(() => {
    const veryBad = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.VeryBad).length
    const bad = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Bad).length
    const ok = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Ok).length
    const good = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Good).length
    const veryGood = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.VeryGood).length
    const notAssessed = participations.length - scoreLevels.length

    return [
      {
        dataKey: 'Assessments',
        veryBad,
        bad,
        ok,
        good,
        veryGood,
        notAssessed,
        total: participations.length,
      },
    ]
  }, [participations, scoreLevels])

  return (
    <Card className='flex flex-col w-full h-full'>
      <CardHeader className='items-center'>
        <CardTitle>Assessment Distribution</CardTitle>
        <CardDescription>Number of assessments per score level</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col justify-end pb-0'>
        <BarChartWithScoreLevel data={chartData} />
      </CardContent>
    </Card>
  )
}
