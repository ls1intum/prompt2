import { Gender } from '@tumaet/prompt-shared-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { GradeDistributionBarChart } from './gradeDistributionBarChart/GradeDistributionBarChart'
import { createGradeDistributionDataPoint } from './gradeDistributionBarChart/utils/createGradeDistributionDataPoint'

interface GenderGradeDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const GenderGradeDiagram = ({
  participationsWithAssessment,
}: GenderGradeDiagramProps): JSX.Element => {
  const chartData = Object.values(Gender).map((gender) => {
    const genderLabel =
      gender === Gender.PREFER_NOT_TO_SAY
        ? 'Unknown'
        : gender.replace(/_/g, ' ').charAt(0).toUpperCase() + gender.replace(/_/g, ' ').slice(1)

    const participationWithAssessment = participationsWithAssessment.filter(
      (p) => p.participation.student.gender === gender,
    )

    const grades = participationWithAssessment
      .map((p) => p.assessmentCompletion?.gradeSuggestion)
      .filter((grade): grade is number => grade !== undefined)

    return createGradeDistributionDataPoint(genderLabel, genderLabel, grades)
  })

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center'>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Grades</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <GradeDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
