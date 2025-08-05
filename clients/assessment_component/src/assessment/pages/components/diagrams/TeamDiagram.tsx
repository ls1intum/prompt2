import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'
import { Team } from '../../../interfaces/team'

import { groupBy } from './utils/groupBy'

interface TeamDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
  teams: Team[]
}

export const TeamDiagram = ({
  participationsWithAssessment,
  teams,
}: TeamDiagramProps): JSX.Element => {
  // Create a map from teamID to team name for quick lookup
  const teamNameMap = new Map(teams.map((team) => [team.id, team.name]))

  const chartData = Array.from(
    groupBy(participationsWithAssessment, (p) => {
      const teamName = teamNameMap.get(p.participation.teamID) ?? 'No Team'
      return teamName
    }),
  ).map(([teamName, participations]) =>
    createScoreDistributionDataPoint(
      teamName.length > 10 ? teamName.substring(0, 8) + '...' : teamName,
      teamName,
      participations.map((p) => p.scoreNumeric),
      participations.map((p) => p.scoreLevel),
    ),
  )

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center'>
        <CardTitle>Team Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <ScoreDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
