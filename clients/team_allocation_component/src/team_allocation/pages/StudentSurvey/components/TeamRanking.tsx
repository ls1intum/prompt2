import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { Team } from '../../../interfaces/team'

interface TeamRankingProps {
  teamRanking: string[]
  teams: Team[]
  setTeamRanking: (teamRanking: string[]) => void
}

export const TeamRanking = ({
  teamRanking,
  teams,
  setTeamRanking,
}: TeamRankingProps): JSX.Element => {
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

  return (
    <Card>
      <CardHeader className='bg-muted/50'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <ClipboardList className='h-5 w-5 text-primary' />
              Team Preferences
            </CardTitle>
            <CardDescription>
              Rank the teams by your preference (1st is most preferred)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='space-y-4'>
          {teamRanking.map((teamID, index) => {
            const team = teams.find((t) => t.id === teamID)
            if (!team) return null
            return (
              <div
                key={team.id}
                className='flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='outline'
                    className='w-8 h-8 rounded-full flex items-center justify-center p-0'
                  >
                    {index + 1}
                  </Badge>
                  <span className='font-medium ml-2'>{team.name}</span>
                </div>
                <div className='flex gap-2'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          size='icon'
                          variant='outline'
                          onClick={() => handleMoveTeam(index, 'up')}
                          disabled={index === 0}
                          className='h-8 w-8'
                        >
                          <ChevronUp className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move up</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type='button'
                          size='icon'
                          variant='outline'
                          onClick={() => handleMoveTeam(index, 'down')}
                          disabled={index === teamRanking.length - 1}
                          className='h-8 w-8'
                        >
                          <ChevronDown className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move down</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
