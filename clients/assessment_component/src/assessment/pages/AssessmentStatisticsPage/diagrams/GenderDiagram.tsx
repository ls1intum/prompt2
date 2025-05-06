import * as React from 'react'

import { Gender } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { StatisticalBarChart } from './components/StatisticalBarChart'
import { StatisticalDataPoint } from './components/StatisticalBarChart'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

const createStatisticalDataPoint = (
  name: string,
  participations: ParticipationWithAssessment[],
): StatisticalDataPoint => {
  if (participations.length === 0) {
    return {
      name,
      average: 0,
      lowerQuartile: 0,
      median: 0,
      upperQuartile: 0,
      counts: {
        novice: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
    }
  }

  const completed = participations.filter((p) => p.scoreLevel)

  return {
    name,
    average: 2.7,
    lowerQuartile: 2.0,
    median: 2.8,
    upperQuartile: 3.2,
    counts: {
      novice: completed.filter((p) => p.scoreLevel === ScoreLevel.Novice).length,
      intermediate: 12,
      advanced: 8,
      expert: 3,
    },
  }
}

interface GenderDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const GenderDiagram = ({
  participationsWithAssessment,
}: GenderDiagramProps): JSX.Element => {
  const females = participationsWithAssessment.filter(
    (p) => p.participation.student.gender === Gender.FEMALE,
  )
  const males = participationsWithAssessment.filter(
    (p) => p.participation.student.gender === Gender.MALE,
  )
  const diverse = participationsWithAssessment.filter(
    (p) =>
      p.participation.student.gender === Gender.DIVERSE ||
      p.participation.student.gender === Gender.PREFER_NOT_TO_SAY,
  )

  const data = [
    createStatisticalDataPoint('Females', females),
    createStatisticalDataPoint('Males', males),
    createStatisticalDataPoint('Diverse', diverse),
  ]

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <StatisticalBarChart data={data} />
      </CardContent>
    </Card>
  )
}
