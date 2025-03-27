import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { SkillResponse } from '../../../interfaces/skillResponse'
import { SurveyResponse } from '../../../interfaces/surveyResponse'
import { TeamPreference } from '../../../interfaces/teamPreference'
import { postSurveyResponse } from '../../../network/mutations/postSurveyResponse'
import { SurveyForm } from '../../../interfaces/surveyForm'
import { useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TeamRanking } from './TeamRanking'
import { SkillRanking } from './SkillRanking'

interface SurveyFormProps {
  surveyForm: SurveyForm
  surveyResponse: SurveyResponse | undefined
  isStudent: boolean
}

export const SurveyFormComponent = ({ surveyForm, surveyResponse, isStudent }: SurveyFormProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  // Local state for ranking teams and rating skills
  const [teamRanking, setTeamRanking] = useState<string[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  // When form and response are loaded, initialize the local state.
  // If no response exists yet, use the teams from the form and default ratings for skills.
  useEffect(() => {
    if (surveyForm) {
      // Initialize team ranking: use the saved preferences if available, else use the order from the survey form.
      if (surveyResponse?.teamPreferences?.length) {
        // sort the saved preferences by the saved ranking value (lower means higher preference)
        const sorted = [...surveyResponse.teamPreferences].sort(
          (a, b) => a.preference - b.preference,
        )
        setTeamRanking(sorted.map((pref) => pref.teamID))
      } else {
        setTeamRanking(surveyForm.teams.map((team) => team.id))
      }

      // Initialize skill ratings: use saved responses if available, else default to 3
      if (surveyResponse?.skillResponses?.length) {
        const ratings: Record<string, number> = {}
        surveyResponse.skillResponses.forEach((sr) => {
          ratings[sr.skillID] = sr.rating
        })
        setSkillRatings(ratings)
      } else {
        const ratings: Record<string, number> = {}
        surveyForm.skills.forEach((skill) => {
          ratings[skill.id] = 3
        })
        setSkillRatings(ratings)
      }
    }
  }, [surveyForm, surveyResponse])

  // Mutation for submitting the updated survey response.
  const updateSurveyResponseMutation = useMutation({
    mutationFn: (response: SurveyResponse) => postSurveyResponse(phaseId ?? '', response),
    onSuccess: () => {
      setSubmitError(null)
      setSubmitSuccess(true)
    },
    onError: () => {
      setSubmitError('Failed to update your survey response. Please try again.')
      setSubmitSuccess(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Create team preferences from the ordering.
    const teamPreferences: TeamPreference[] = teamRanking.map((teamID, index) => ({
      teamID,
      preference: index + 1, // rank 1 for the first item, 2 for the second, etc.
    }))
    // Create skill responses from the ratings.
    const skillResponses: SkillResponse[] = Object.entries(skillRatings).map(
      ([skillID, rating]) => ({
        skillID,
        rating,
      }),
    )

    const response: SurveyResponse = { teamPreferences, skillResponses }
    updateSurveyResponseMutation.mutate(response)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Teams Ranking Section */}
      <TeamRanking
        teamRanking={teamRanking}
        teams={surveyForm.teams}
        setTeamRanking={setTeamRanking}
      />
      {/* Skills Rating Section */}
      <SkillRanking
        skills={surveyForm.skills}
        skillRatings={skillRatings}
        setSkillRatings={setSkillRatings}
      />

      {submitError && (
        <Alert variant='destructive' className='mb-4 w-full'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <div className='flex items-center gap-2 text-green-600'>
          <CheckCircle2 className='h-5 w-5' />
          <span>Survey response submitted successfully!</span>
        </div>
      )}

      <div className='flex-1'></div>

      <Button
        type='submit'
        size='lg'
        disabled={!isStudent || updateSurveyResponseMutation.isPending}
        className='w-full sm:w-auto'
      >
        {updateSurveyResponseMutation.isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Submit Survey Response'
        )}
      </Button>
    </form>
  )
}
