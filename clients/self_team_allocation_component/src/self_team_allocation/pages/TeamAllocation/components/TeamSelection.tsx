import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users } from 'lucide-react'
import type { Team } from '../../../interfaces/team'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { TeamCreationDialog } from './TeamCreationDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { DeleteConfirmation } from '@/components/DeleteConfirmationDialog'
import { TeamCard } from './TeamCard'
import { createTeamAssignment } from '../../../network/mutations/createTeamAllocation'
import { deleteTeamAssignment } from '../../../network/mutations/deleteTeamAllocation'
import { createTeam } from '../../../network/mutations/createTeam'
import { deleteTeam } from '../../../network/mutations/deleteTeam'
import { Timeframe } from '../../../interfaces/timeframe'

interface Props {
  teams: Team[]
  courseParticipationID?: string
  refetchTeams: () => void
  timeframe: Timeframe
}

export const TeamSelection: React.FC<Props> = ({
  teams,
  courseParticipationID,
  refetchTeams,
  timeframe,
}) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const isLecturer = !courseParticipationID
  const queryClient = useQueryClient()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  const joinMutation = useMutation({
    mutationFn: (teamId: string) => createTeamAssignment(phaseId ?? '', teamId),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => setSubmitError('Failed to join team. Please try again.'),
  })

  const leaveMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeamAssignment(phaseId ?? '', teamId),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => setSubmitError('Failed to leave team. Please try again.'),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => createTeam(phaseId ?? '', [name]),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => setSubmitError('Failed to create team. Please try again.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeam(phaseId ?? '', teamId),
    onSuccess: () => {
      setSubmitError(null)
      queryClient.invalidateQueries({ queryKey: ['self_team_allocations', phaseId] })
    },
    onError: () => setSubmitError('Failed to delete team. Please try again.'),
  })

  const myTeam = useMemo(
    () =>
      teams.find((team) =>
        team.members.some((m) => m.courseParticipationID === courseParticipationID),
      ),
    [teams, courseParticipationID],
  )

  const disabled = timeframe.timeframeSet && timeframe.endTime < new Date() || timeframe.startTime > new Date()
  const joiningDisabled = Boolean(myTeam) || isLecturer

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => (myTeam?.id === a.id ? -1 : myTeam?.id === b.id ? 1 : 0)),
    [teams, myTeam],
  )

  return (
    <div className='container mx-auto py-6 space-y-8'>
      <div className='flex items-center justify-between'>
        <ManagementPageHeader>Team Allocation</ManagementPageHeader>
        <Button variant='outline' onClick={refetchTeams} className='flex items-center gap-2'>
          <RefreshCw className='h-4 w-4' />
          Reload Teams
        </Button>
      </div>

      {submitError && <div className='alert-error'>{submitError}</div>}

      {!disabled && (
        <div className='flex justify-end mb-6'>
          <TeamCreationDialog onCreate={(name) => createMutation.mutate(name)} teams={teams} />
        </div>
      )}

      {sortedTeams.length > 0 ? (
        <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {sortedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isMember={myTeam?.id === team.id}
              full={team.members.length >= 3}
              isLecturer={isLecturer}
              joiningDisabled={joiningDisabled}
              disabled={disabled}
              courseParticipationID={courseParticipationID}
              onJoin={(id) => joinMutation.mutate(id)}
              onLeave={(id) => leaveMutation.mutate(id)}
              onDelete={(delTeam) => {
                setTeamToDelete(delTeam)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>
      ) : (
        <div className='empty-state'>
          <Users className='h-12 w-12 text-muted-foreground mb-4' />
          <h3>No Teams Available</h3>
          <p>Create a new team to get started.</p>
        </div>
      )}

      {teamToDelete && (
        <DeleteConfirmation
          isOpen={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onClick={(ok) => ok && deleteMutation.mutate(teamToDelete.id)}
          deleteMessage='Are you sure you want to delete this team?'
        />
      )}
    </div>
  )
}
