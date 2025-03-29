import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { Skill } from '../../interfaces/skill'
import { getAllSkills } from '../../network/queries/getAllSkills'
import { useParams } from 'react-router-dom'
import { Team } from '../../interfaces/team'
import { getAllTeams } from '../../network/queries/getAllTeams'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import { useQuery } from '@tanstack/react-query'
import { getSurveyTimeframe } from '../../network/queries/getSurveyTimeframe'
import { SurveyTimeframe } from '../../interfaces/timeframe'
import { TeamSettings } from './components/TeamSettings'
import { SkillSettings } from './components/SkillSettings'
import { SurveyTimeframeSettings } from './components/SurveyTimeframeSettings'

export const SurveySettingsPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: fetchedSkills,
    isPending: isSkillsPending,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery<Skill[]>({
    queryKey: ['team_allocation_skill', phaseId],
    queryFn: () => getAllSkills(phaseId ?? ''),
  })

  const {
    data: fetchedTeams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ['team_allocation_team', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })

  const {
    data: fetchedSurveyTimeframe,
    isPending: isSurveyTimeframePending,
    isError: isSurveyTimeframeError,
    refetch: refetchTimeframe,
  } = useQuery<SurveyTimeframe>({
    queryKey: ['team_allocation_survey_timeframe', phaseId],
    queryFn: () => getSurveyTimeframe(phaseId ?? ''),
  })

  const isPending = isSkillsPending || isTeamsPending || isSurveyTimeframePending
  const isError = isSkillsError || isTeamsError || isSurveyTimeframeError
  const refetch = () => {
    refetchSkills()
    refetchTeams()
    refetchTimeframe()
  }

  if (isError) {
    return <ErrorPage onRetry={refetch} />
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center flex-grow'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <>
      <ManagementPageHeader>Survey Settings</ManagementPageHeader>
      {/* 1. Set the survey timeframe, skills and teams for this phase. */}
      <SurveyTimeframeSettings surveyTimeframe={fetchedSurveyTimeframe} />
      {/* 2. Set up the teams */}
      <TeamSettings teams={fetchedTeams} />
      {/* 3. Set up the skills */}
      <SkillSettings skills={fetchedSkills} />
    </>
  )
}
