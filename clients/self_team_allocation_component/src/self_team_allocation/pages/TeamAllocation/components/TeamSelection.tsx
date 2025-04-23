import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, LogOut } from 'lucide-react'
import type { Team } from '../../../interfaces/team'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { TeamCreationDialog } from './TeamCreationDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTeamAssignment } from '../../../network/mutations/createTeamAllocation'
import { useParams } from 'react-router-dom'
import { deleteTeamAssignment } from '../../../network/mutations/deleteTeamAllocation'
import { createTeam } from '../../../network/mutations/createTeam'

interface Props {
  teams: Team[]
  courseParticipationID?: string
}

export const TeamSelection: React.FC<Props> = ({ teams, courseParticipationID }) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const isLecturer = courseParticipationID === undefined
  const queryClient = useQueryClient()

  const [submitError, setSubmitError] = useState<string | null>(null)

  const joinMutation = useMutation({
    mutationFn: (teamId: string) => createTeamAssignment(phaseId ?? '', teamId),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => {
      setSubmitError('Failed to join team. Please try again.')
    },
  })

  const leaveMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeamAssignment(phaseId ?? '', teamId),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => {
      setSubmitError('Failed to leave team. Please try again.')
    },
  })

  // Note: if you actually have a backend mutation to _create_ a team, import & use that here.
  // For now this just re-uses `createTeamAssignment` as a placeholder.
  const createMutation = useMutation({
    mutationFn: (name: string) => createTeam(phaseId ?? '', [name]),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => {
      setSubmitError('Failed to create team. Please try again.')
    },
  })

  // find the team the current student belongs to (undefined if lecturer or unassigned)
  const myTeam = useMemo(
    () =>
      teams.find((team) =>
        team.members.some((m) => m.courseParticipationID === courseParticipationID),
      ),
    [teams, courseParticipationID],
  )

  const isLocked = Boolean(myTeam) || isLecturer

  return (
    <div className='container mx-auto py-6 space-y-8'>
      <ManagementPageHeader>Team Allocation</ManagementPageHeader>

      {/* show any error */}
      {submitError && (
        <div className='px-4 py-2 bg-red-100 text-red-800 rounded'>{submitError}</div>
      )}

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex justify-end'>
          <TeamCreationDialog
            onCreate={(name: string) => {
              createMutation.mutate(name)
            }}
          />
        </div>
      </div>

      {teams.length > 0 ? (
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[...teams]
            .sort((a, b) => {
              if (myTeam?.id === a.id) return -1
              if (myTeam?.id === b.id) return 1
              return 0
            })
            .map((team) => {
              const isMember = myTeam?.id === team.id
              const full = team.members.length >= 3

              return (
                <Card
                  key={team.id}
                  className={`overflow-hidden transition-all duration-200 flex flex-col h-[280px] ${
                    isMember ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex justify-between items-center'>
                      <CardTitle className='text-lg font-semibold truncate'>{team.name}</CardTitle>
                      <Badge
                        variant={full ? 'destructive' : 'secondary'}
                        className='ml-2 whitespace-nowrap'
                      >
                        {team.members.length}/3 Members
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className='pb-4 flex-1'>
                    {team.members.length ? (
                      <ul className='space-y-2 h-[120px] overflow-y-auto'>
                        {team.members.map((m, idx) => {
                          const isCurrentUser = m.courseParticipationID === courseParticipationID
                          return (
                            <li
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded-md ${
                                isCurrentUser
                                  ? 'bg-primary/10 font-medium text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              <Users size={16} className={isCurrentUser ? 'text-primary' : ''} />
                              <span className='truncate'>{m.studentName}</span>
                              {isCurrentUser && (
                                <Badge variant='outline' className='ml-auto text-xs'>
                                  You
                                </Badge>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className='flex items-center justify-center h-[120px] text-muted-foreground italic bg-muted/30 rounded-md'>
                        <p>No members yet</p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className='pt-2 pb-4'>
                    {isMember ? (
                      <Button
                        variant='destructive'
                        className='w-full'
                        onClick={() => leaveMutation.mutate(team.id)}
                      >
                        <LogOut className='mr-2 h-4 w-4' />
                        Leave Team
                      </Button>
                    ) : (
                      <Button
                        className='w-full'
                        onClick={() => joinMutation.mutate(team.id)}
                        disabled={isLocked || full}
                        variant={full ? 'outline' : 'default'}
                      >
                        <UserPlus className='mr-2 h-4 w-4' />
                        {full ? 'Team Full' : 'Join Team'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-lg border border-dashed'>
          <Users className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium mb-2'>No Teams Available</h3>
          <p className='text-muted-foreground mb-4'>
            Create a new team to get started with team allocation.
          </p>
        </div>
      )}
    </div>
  )
}
