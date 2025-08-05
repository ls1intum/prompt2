import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { GradeDistributionBarChart } from './gradeDistributionBarChart/GradeDistributionBarChart'
import { createGradeDistributionDataPoint } from './gradeDistributionBarChart/utils/createGradeDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'
import { Team } from '../../../interfaces/team'

import { groupBy } from './utils/groupBy'

interface TeamGradeDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
  teams: Team[]
}

export const TeamGradeDiagram = ({
  participationsWithAssessment,
  teams,
}: TeamGradeDiagramProps): JSX.Element => {
  // Create a map from teamID to team name for quick lookup
  const teamNameMap = new Map(teams.map((team) => [team.id, team.name]))

  const chartData = Array.from(
    groupBy(participationsWithAssessment, (p) => {
      const teamName = teamNameMap.get(p.participation.teamID) ?? 'No Team'
      return teamName
    }),
  ).map(([teamName, participations]) => {
    const grades = participations
      .map((p) => p.assessmentCompletion?.gradeSuggestion)
      .filter((grade): grade is number => grade !== undefined)

    return createGradeDistributionDataPoint(
      teamName.length > 10 ? teamName.substring(0, 8) + '...' : teamName,
      teamName,
      grades,
    )
  })

  return (
    <Card className={`flex flex-col ${getGridSpanClass(chartData.length)}`}>
      <CardHeader className='items-center'>
        <CardTitle>Team Distribution</CardTitle>
        <CardDescription>Grades</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <GradeDistributionBarChart data={chartData} />
      </CardContent>
    </Card>
  )
}
