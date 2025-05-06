import { Gender } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { StatisticalBarChart } from './components/StatisticalBarChart'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'

import { createStatisticalDataPoint } from './utils/createStatisticalDataPoint'

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
