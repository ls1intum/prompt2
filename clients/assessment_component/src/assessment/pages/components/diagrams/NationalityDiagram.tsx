import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'
import { getCountryName } from '@/lib/getCountries'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'

import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'

import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { groupBy } from './utils/groupBy'

interface NationalityDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
}

export const NationalityDiagram = ({
  participationsWithAssessment,
}: NationalityDiagramProps): JSX.Element => {
  const chartData = Array.from(
    groupBy(participationsWithAssessment, (p) => p.participation.student.nationality || 'Unknown'),
  ).map(([nationality, participations]) => {
    return createScoreDistributionDataPoint(
      nationality,
      getCountryName(nationality) ?? 'Unknown',
      participations.map((p) => p.scoreNumeric),
      participations.map((p) => p.scoreLevel),
    )
  })

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Nationality Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ScoreDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
