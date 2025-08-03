import { useMemo } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'

import { BarChartWithGrades } from './BarChartWithGrades'

interface GradeDistributionDiagramProps {
  participations: AssessmentParticipationWithStudent[]
  grades: number[]
}

export const GradeDistributionDiagram = ({
  participations,
  grades,
}: GradeDistributionDiagramProps): JSX.Element => {
  const chartData = useMemo(() => {
    const validGradeValues = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0]
    const gradeData = validGradeValues.map((gradeValue) => {
      const count = grades.filter((grade) => Math.abs(grade - gradeValue) < 0.01).length

      return {
        dataKey: gradeValue.toFixed(1),
        count: count,
        total: participations.length,
      }
    })

    // Add not graded data point
    const notGraded = participations.length - grades.length
    if (notGraded > 0) {
      gradeData.push({
        dataKey: 'No Grade',
        count: notGraded,
        total: participations.length,
      })
    }

    return gradeData
  }, [participations, grades])

  return (
    <Card className='flex flex-col w-full h-full'>
      <CardHeader className='items-center'>
        <CardTitle>Grade Distribution</CardTitle>
        <CardDescription>Number of students per grade</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col justify-end pb-0'>
        <BarChartWithGrades data={chartData} />
      </CardContent>
    </Card>
  )
}
