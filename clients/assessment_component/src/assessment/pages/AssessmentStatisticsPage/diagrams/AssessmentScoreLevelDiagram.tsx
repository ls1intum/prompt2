import { useMemo } from 'react'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreLevel } from '../../../interfaces/scoreLevel'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'

import { BarChartWithScoreLevel } from './BarChartWithScoreLevel'

interface AssessmentScoreLevelDiagramProps {
  participations: CoursePhaseParticipationWithStudent[]
  scoreLevels: ScoreLevelWithParticipation[]
}

export const AssessmentScoreLevelDiagram = ({
  participations,
  scoreLevels,
}: AssessmentScoreLevelDiagramProps): JSX.Element => {
  const chartData = useMemo(() => {
    const novice = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Novice).length
    const intermediate = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Intermediate).length
    const advanced = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Advanced).length
    const expert = scoreLevels.filter((s) => s.scoreLevel === ScoreLevel.Expert).length
    const notAssessed = participations.length - scoreLevels.length

    return [
      {
        dataKey: 'Assessments',
        novice,
        intermediate,
        advanced,
        expert,
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
