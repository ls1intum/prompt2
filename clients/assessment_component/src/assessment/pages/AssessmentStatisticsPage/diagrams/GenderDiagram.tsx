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
  const groupByGender = (gender: Gender | Gender[]) => {
    const participationsWithAssessmentFiltered = participationsWithAssessment.filter((p) =>
      Array.isArray(gender)
        ? p.participation.student.gender !== undefined &&
          gender.includes(p.participation.student.gender)
        : p.participation.student.gender === gender,
    )

    return {
      scores: participationsWithAssessmentFiltered
        .map((p) => p.assessments.map((a) => a.scoreLevel))
        .flat(),
      scoreLevels: participationsWithAssessmentFiltered
        .map((p) => p.scoreLevel)
        .filter((scoreLevel) => scoreLevel !== undefined),
    }
  }

  const females = groupByGender(Gender.FEMALE)
  const males = groupByGender(Gender.MALE)
  const diverse = groupByGender([Gender.DIVERSE, Gender.PREFER_NOT_TO_SAY])

  const data = [
    createScoreDistributionDataPoint('Female', 'Female', females.scores, females.scoreLevels),
    createScoreDistributionDataPoint('Male', 'Male', males.scores, males.scoreLevels),
    createScoreDistributionDataPoint('Diverse', 'Diverse', diverse.scores, diverse.scoreLevels),
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
