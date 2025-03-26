import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ErrorPage } from '@/components/ErrorPage'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, TriangleAlert, ChevronUp, ChevronDown } from 'lucide-react'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SurveyForm } from '../../interfaces/surveyForm'
import { SurveyResponse } from '../../interfaces/surveyResponse'
import { getSurveyForm } from '../../network/queries/getSurveyForm'
import { getSurveyOwnResponse } from '../../network/queries/getSurveyOwnResponse'
import { postSurveyResponse } from '../../network/mutations/postSurveyResponse'
import { TeamPreference } from '../../interfaces/teamPreference'
import { SkillResponse } from '../../interfaces/skillResponse'

export const StudentSurveyPage = (): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  // Get the survey form (teams & skills)
  const {
    data: fetchedSurveyForm,
    isPending: isSurveyFormPending,
    isError: isSurveyFormError,
    refetch: refetchSurveyForm,
  } = useQuery<SurveyForm | undefined>({
    queryKey: ['team_allocation_survey_form', phaseId], // TODO also update on skill / teams change
    queryFn: () => getSurveyForm(phaseId ?? ''),
  })

  // Get the student’s saved response, if any
  const {
    data: fetchedStudentSurveyResponse,
    isPending: isStudentSurveyResponsePending,
    isError: isStudentSurveyResponseError,
    refetch: refetchStudentSurveyResponse,
  } = useQuery<SurveyResponse>({
    queryKey: ['team_allocation_student_survey_response', phaseId],
    queryFn: () => getSurveyOwnResponse(phaseId ?? ''),
    enabled: isStudent,
  })

  const isPending = isSurveyFormPending || isStudentSurveyResponsePending
  const isError = isSurveyFormError || isStudentSurveyResponseError
  const surveyNotStarted = fetchedSurveyForm === undefined

  // Local state for ranking teams and rating skills
  const [teamRanking, setTeamRanking] = useState<string[]>([])
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // When form and response are loaded, initialize the local state.
  // If no response exists yet, use the teams from the form and default ratings for skills.
  useEffect(() => {
    if (fetchedSurveyForm) {
      // Initialize team ranking: use the saved preferences if available, else use the order from the survey form.
      if (fetchedStudentSurveyResponse?.teamPreferences?.length) {
        // sort the saved preferences by the saved ranking value (lower means higher preference)
        const sorted = [...fetchedStudentSurveyResponse.teamPreferences].sort(
          (a, b) => a.preference - b.preference,
        )
        setTeamRanking(sorted.map((pref) => pref.teamID))
      } else {
        setTeamRanking(fetchedSurveyForm.teams.map((team) => team.id))
      }

      // Initialize skill ratings: use saved responses if available, else default to 3
      if (fetchedStudentSurveyResponse?.skillResponses?.length) {
        const ratings: Record<string, number> = {}
        fetchedStudentSurveyResponse.skillResponses.forEach((sr) => {
          ratings[sr.skillID] = sr.rating
        })
        setSkillRatings(ratings)
      } else {
        const ratings: Record<string, number> = {}
        fetchedSurveyForm.skills.forEach((skill) => {
          ratings[skill.id] = 3
        })
        setSkillRatings(ratings)
      }
    }
  }, [fetchedSurveyForm, fetchedStudentSurveyResponse])

  // Mutation for submitting the updated survey response.
  const updateSurveyResponseMutation = useMutation({
    mutationFn: (response: SurveyResponse) => postSurveyResponse(phaseId ?? '', response),
    onSuccess: () => {
      setSubmitError(null)
      // Optionally refetch data or show a success message
    },
    onError: () => {
      setSubmitError('Failed to update your survey response. Please try again.')
    },
  })

  const handleMoveTeam = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...teamRanking]
    if (direction === 'up' && index > 0) {
      const temp = newOrder[index - 1]
      newOrder[index - 1] = newOrder[index]
      newOrder[index] = temp
    }
    if (direction === 'down' && index < newOrder.length - 1) {
      const temp = newOrder[index + 1]
      newOrder[index + 1] = newOrder[index]
      newOrder[index] = temp
    }
    setTeamRanking(newOrder)
  }

  const handleSkillRatingChange = (skillID: string, rating: number) => {
    setSkillRatings({ ...skillRatings, [skillID]: rating })
  }

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

  if (isError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchSurveyForm()
          refetchStudentSurveyResponse()
        }}
      />
    )
  }

  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>You are not a student of this course.</AlertTitle>
          <AlertDescription>
            The survey is disabled because you are not a student of this course.
          </AlertDescription>
        </Alert>
      )}

      {surveyNotStarted && <div>The survey has not yet started. Please check back later.</div>}

      {fetchedSurveyForm && (
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Teams Ranking Section */}
          <div>
            <h2 className='text-xl font-semibold mb-2'>Rank the Teams</h2>
            <p className='mb-4 text-sm text-muted-foreground'>
              Drag the teams to rank them by preference. (Use the arrows to adjust the ranking)
            </p>
            <ul>
              {teamRanking.map((teamID, index) => {
                const team = fetchedSurveyForm.teams.find((t) => t.id === teamID)
                if (!team) return null
                return (
                  <li
                    key={team.id}
                    className='flex items-center justify-between p-2 border rounded mb-2'
                  >
                    <span>{team.name}</span>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => handleMoveTeam(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className='h-4 w-4' />
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => handleMoveTeam(index, 'down')}
                        disabled={index === teamRanking.length - 1}
                      >
                        <ChevronDown className='h-4 w-4' />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Skills Rating Section */}
          <div>
            <h2 className='text-xl font-semibold mb-2'>Rate Your Skills</h2>
            <p className='mb-4 text-sm text-muted-foreground'>
              Please rate each skill on a scale from 1 (low) to 5 (high)
            </p>
            <div className='space-y-4'>
              {fetchedSurveyForm.skills.map((skill) => (
                <div key={skill.id} className='flex flex-col'>
                  <span className='mb-1 font-medium'>{skill.name}</span>
                  <RadioGroup
                    value={String(skillRatings[skill.id] || 3)}
                    onChange={(value) => handleSkillRatingChange(skill.id, Number(value))}
                    className='flex gap-2'
                  >
                    {[1, 2, 3, 4, 5].map((val) => (
                      <RadioGroupItem key={val} value={String(val)} />
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          {submitError && <p className='text-destructive'>{submitError}</p>}

          <Button type='submit' disabled={!isStudent || updateSurveyResponseMutation.isPending}>
            {updateSurveyResponseMutation.isPending ? 'Submitting...' : 'Submit Survey Response'}
          </Button>
        </form>
      )}
    </>
  )
}
