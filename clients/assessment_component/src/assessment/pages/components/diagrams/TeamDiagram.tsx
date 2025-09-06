import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tumaet/prompt-ui-components'

import { ScoreDistributionBarChart } from './scoreDistributionBarChart/ScoreDistributionBarChart'
import { GradeDistributionBarChart } from './gradeDistributionBarChart/GradeDistributionBarChart'
import { createScoreDistributionDataPoint } from './scoreDistributionBarChart/utils/createScoreDistributionDataPoint'
import { createGradeDistributionDataPoint } from './gradeDistributionBarChart/utils/createGradeDistributionDataPoint'

import { getGridSpanClass } from './utils/getGridSpanClass'
import { ParticipationWithAssessment } from './interfaces/ParticipationWithAssessment'
import { Team } from '../../../interfaces/team'

import { groupBy } from './utils/groupBy'

interface TeamDiagramProps {
  participationsWithAssessment: ParticipationWithAssessment[]
  teams: Team[]
  showGrade?: boolean
}

export const TeamDiagram = ({
  participationsWithAssessment,
  teams,
  showGrade = false,
}: TeamDiagramProps): JSX.Element => {
  // Create a map from teamID to team name for quick lookup
  const teamNameMap = new Map(teams.map((team) => [team.id, team.name]))

  const data = Array.from(
    groupBy(participationsWithAssessment, (p) => {
      const teamName = teamNameMap.get(p.participation.teamID) ?? 'No Team'
      return teamName
    }),
  ).map(([teamName, participations]) => {
    return {
      shortLabel: teamName.length > 10 ? teamName.substring(0, 8) + '...' : teamName,
      label: teamName,
      participationWithAssessment: participations,
    }
  })

  return (
    <Card className={`flex flex-col ${getGridSpanClass(data.length)}`}>
      <CardHeader className='items-center'>
        <CardTitle>Team Distribution</CardTitle>
        <CardDescription>Scores</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        {showGrade ? (
          <GradeDistributionBarChart
            data={data.map((d) =>
              createGradeDistributionDataPoint(
                d.shortLabel,
                d.label,
                d.participationWithAssessment
                  .map((p) => p.assessmentCompletion?.gradeSuggestion)
                  .filter((grade): grade is number => grade !== undefined),
              ),
            )}
          />
        ) : (
          <ScoreDistributionBarChart
            data={data.map((d) =>
              createScoreDistributionDataPoint(
                d.shortLabel,
                d.label,
                d.participationWithAssessment.map((p) => p.scoreNumeric),
                d.participationWithAssessment.map((p) => p.scoreLevel),
              ),
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
