import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { getCountryName } from '@/lib/getCountries'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'

import { ParticipationWithAssessment } from '../interfaces/ParticipationWithAssessment'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'

interface NationalityDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const NationalityDiagram = ({
  participationsWithAssessment,
}: NationalityDiagramProps): JSX.Element => {
  const nationalityMap = new Map<string, ScoreLevel[]>()
  participationsWithAssessment.forEach((p) => {
    const nationality = p.participation.student.nationality || 'Unknown'

    if (p.scoreLevel !== undefined) {
      if (!nationalityMap.has(nationality)) {
        nationalityMap.set(nationality, [])
      }
      nationalityMap.get(nationality)?.push(...p.assessments.map((a) => a.score))
    }
  })

  const data = Array.from(nationalityMap.entries()).map(([nationality, participations]) =>
    createScoreDistributionDataPoint(
      nationality,
      getCountryName(nationality) ?? 'Unknown Nationality',
      participations,
    ),
  )

  return (
    <Card className={`flex flex-col ${getGridSpanClass(nationalityMap.size)}`}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Nationality Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ScoreDistributionBarChart data={data} />
      </CardContent>
    </Card>
  )
}
