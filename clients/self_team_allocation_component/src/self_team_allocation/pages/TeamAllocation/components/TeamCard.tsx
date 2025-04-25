import type React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, LogOut, Trash2 } from 'lucide-react'
import type { Team } from '../../../interfaces/team'

export interface TeamCardProps {
  team: Team
  isMember: boolean
  full: boolean
  isLecturer: boolean
  joiningDisabled: boolean
  disabled: boolean
  courseParticipationID?: string
  onJoin: (teamId: string) => void
  onLeave: (teamId: string) => void
  onDelete: (team: Team) => void
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isMember,
  full,
  isLecturer,
  joiningDisabled,
  disabled,
  courseParticipationID,
  onJoin,
  onLeave,
  onDelete,
}) => (
  <Card
    className={`overflow-hidden transition-all duration-200 flex flex-col h-[280px] ${
      isMember ? 'ring-2 ring-primary shadow-md' : ''
    }`}
  >
    <CardHeader className='pb-3'>
      <CardTitle
        className={`font-semibold truncate pb-2 ${team.name.length > 20 ? 'text-base' : ''}`}
      >
        {team.name}
      </CardTitle>
      <CardDescription className='flex items-center'>
        <Badge variant={full ? 'destructive' : 'secondary'} className='whitespace-nowrap text-sm'>
          {team.members.length}/3 Members
        </Badge>
      </CardDescription>
    </CardHeader>

    <CardContent className='pb-4 flex-1'>
      {team.members.length > 0 ? (
        <ul className='space-y-2 h-[120px] overflow-y-auto'>
          {team.members.map((m, idx) => {
            const isCurrent = m.courseParticipationID === courseParticipationID
            return (
              <li
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-md ${
                  isCurrent ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'
                }`}
              >
                <Users size={16} className={isCurrent ? 'text-primary' : ''} />
                <span className='truncate'>{m.studentName}</span>
                {isCurrent && (
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

    <CardFooter className='pt-2 pb-4 space-y-2'>
      {!isLecturer &&
        (isMember ? (
          <Button
            variant='destructive'
            className='w-full'
            onClick={() => onLeave(team.id)}
            disabled={disabled}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Leave Team
          </Button>
        ) : (
          <Button
            className='w-full'
            onClick={() => onJoin(team.id)}
            disabled={joiningDisabled || full || disabled}
            variant={full ? 'outline' : 'default'}
          >
            <UserPlus className='mr-2 h-4 w-4' />
            {full ? 'Team Full' : 'Join Team'}
          </Button>
        ))}

      {isLecturer && (
        <Button
          variant='destructive'
          className='w-full flex items-center justify-center gap-2'
          onClick={() => onDelete(team)}
        >
          <Trash2 className='h-4 w-4' />
          Delete Team
        </Button>
      )}
    </CardFooter>
  </Card>
)
