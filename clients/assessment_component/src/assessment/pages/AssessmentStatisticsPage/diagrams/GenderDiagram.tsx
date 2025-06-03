import { Gender } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

interface GenderDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const GenderDiagram = ({
  participationsWithAssessment,
}: GenderDiagramProps): JSX.Element => {
  const groupByGender = (gender: Gender | Gender[]) =>
    participationsWithAssessment
      .filter((p) =>
        Array.isArray(gender)
          ? p.participation.student.gender !== undefined &&
            gender.includes(p.participation.student.gender)
          : p.participation.student.gender === gender,
      )
      .map((p) => p.assessments.map((a) => a.score))
      .flat()

  const females = groupByGender(Gender.FEMALE)
  const males = groupByGender(Gender.MALE)
  const diverse = groupByGender([Gender.DIVERSE, Gender.PREFER_NOT_TO_SAY])

  const data = [
    createScoreDistributionDataPoint('Female', 'Female', females),
    createScoreDistributionDataPoint('Male', 'Male', males),
    createScoreDistributionDataPoint('Diverse', 'Diverse', diverse),
  ]

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ScoreDistributionBarChart data={data} />
      </CardContent>
    </Card>
  )
}
