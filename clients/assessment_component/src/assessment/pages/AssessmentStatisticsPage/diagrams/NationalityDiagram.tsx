import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { getCountryName } from '@/lib/getCountries'

import { StatisticalBarChart } from './components/StatisticalBarChart'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { createStatisticalDataPoint } from './utils/createStatisticalDataPoint'

interface NationalityDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const NationalityDiagram = ({
  participationsWithAssessment,
}: NationalityDiagramProps): JSX.Element => {
  const nationalityMap = new Map<string, ScoreLevel[]>()
  participationsWithAssessment.forEach((p) => {
    const nationality =
      getCountryName(p.participation.student.nationality ?? '') ?? 'Unknown Nationality'

    if (!nationalityMap.has(nationality)) {
      nationalityMap.set(nationality, [])
    }
    if (p.scoreLevel !== undefined) {
      nationalityMap.get(nationality)?.push(p.scoreLevel)
    }
  })

  const data = Array.from(nationalityMap.entries()).map(([nationality, participations]) =>
    createStatisticalDataPoint(nationality, participations),
  )

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Author Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <StatisticalBarChart data={data} />
      </CardContent>
    </Card>
  )
}
