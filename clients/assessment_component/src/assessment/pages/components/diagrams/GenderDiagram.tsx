import { Gender } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

interface GenderDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const GenderDiagram = ({
  participationsWithAssessment,
}: GenderDiagramProps): JSX.Element => {
  const chartData = Object.values(Gender).map((gender) => {
    const genderLabel =
      gender === Gender.PREFER_NOT_TO_SAY
        ? 'Unknown'
        : gender.replace(/_/g, ' ').charAt(0).toUpperCase() + gender.replace(/_/g, ' ').slice(1)

    const participationWithAssessment = participationsWithAssessment.filter(
      (p) => p.participation.student.gender === gender,
    )

    return createScoreDistributionDataPoint(
      genderLabel,
      genderLabel,
      participationWithAssessment.map((p) => p.scoreNumeric),
      participationWithAssessment.map((p) => p.scoreLevel),
    )
  })

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center'>
        <CardTitle>Gender Distribution </CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <ScoreDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
