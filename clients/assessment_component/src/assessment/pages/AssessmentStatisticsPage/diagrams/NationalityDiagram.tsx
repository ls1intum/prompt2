import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { getCountryName } from '../../utils/getCountries'

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
      nationalityMap.get(nationality)?.push(p.scoreLevel)
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
        {data.length === 0 ? (
          <div className='flex items-center justify-center h-64 text-gray-500'>
            <p>No nationality data available</p>
          </div>
        ) : (
          <ScoreDistributionBarChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}
