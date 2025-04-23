import type React from 'react'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, LogOut } from 'lucide-react'
import type { Team } from '../../../interfaces/team'
import type { TeamAllocation } from '../../../interfaces/teamAllocation'
import { ManagementPageHeader } from '@/components/managementPageHeader'
import { TeamCreationDialog } from './TeamCreationDialog'

interface Props {
  teams: Team[]
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
  allocations: TeamAllocation[]
  setAllocations: React.Dispatch<React.SetStateAction<TeamAllocation[]>>
  studentName: string
  courseParticipationID?: string
}

export const TeamSelection = ({
  teams,
  setTeams,
  allocations,
  setAllocations,
  studentName,
  courseParticipationID,
}: Props) => {
  const isLecturer = courseParticipationID === undefined

  // student's current allocation (undefined for lecturer or unassigned student)
  const myAlloc = useMemo(
    () => allocations.find((a) => a.courseParticipationID === courseParticipationID),
    [allocations, courseParticipationID],
  )

  // lock actions if they already have a team or if they're a lecturer
  const isLocked = Boolean(myAlloc) || isLecturer

  const joinTeam = (teamId: string) => {
    if (isLocked) return
    setAllocations([
      ...allocations,
      { projectId: teamId, studentName, courseParticipationID: courseParticipationID! },
    ])
  }

  const leaveTeam = (teamId: string) => {
    setAllocations(
      allocations.filter(
        (a) => !(a.projectId === teamId && a.courseParticipationID === courseParticipationID),
      ),
    )
  }

  return (
    <div className='container mx-auto py-6 space-y-8'>
      <ManagementPageHeader>Team Allocation</ManagementPageHeader>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex justify-end'>
          <TeamCreationDialog
            onCreate={(name) => {
              setTeams((prev) => [
                ...prev,
                { id: crypto.randomUUID(), name, members: [studentName] },
              ])
            }}
          />
        </div>
      </div>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {[...teams]
          .sort((a, b) => {
            // Sort selected team first
            if (myAlloc?.projectId === a.id) return -1
            if (myAlloc?.projectId === b.id) return 1
            return 0
          })
          .map((team) => {
            const members = allocations
              .filter((a) => a.projectId === team.id)
              .map((a) => a.studentName)

            const isMember = myAlloc?.projectId === team.id
            const full = members.length >= 3

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
                      {members.length}/3 Members
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='pb-4 flex-1'>
                  {members.length ? (
                    <ul className='space-y-2 h-[120px] overflow-y-auto'>
                      {members.map((name, idx) => {
                        const isCurrentUser =
                          allocations.find((a) => a.projectId === team.id && a.studentName === name)
                            ?.courseParticipationID === courseParticipationID

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
                            <span className='truncate'>{name}</span>
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
                      onClick={() => leaveTeam(team.id)}
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Leave Team
                    </Button>
                  ) : (
                    <Button
                      className='w-full'
                      onClick={() => joinTeam(team.id)}
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

      {teams.length === 0 && (
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
