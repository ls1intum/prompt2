import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Award, BookOpen, Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'

import type { TeaseStudent } from '../../../interfaces/tease/student'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllTeams } from '../../../network/queries/getAllTeams'
import { getAllSkills } from '../../../network/queries/getAllSkills'
import { Team } from '../../../interfaces/team'

interface StudentDetailDialogProps {
  student: TeaseStudent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailDialog({ student, open, onOpenChange }: StudentDetailDialogProps) {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: teams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ['tease_teams', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })

  const {
    data: skills,
    isPending: isSkillsPending,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ['tease_skills', phaseId],
    queryFn: () => getAllSkills(phaseId ?? ''),
  })

  function getTeamNameById(teamId: string): string {
    const team = teams?.find((t) => t.id === teamId)
    return team ? team.name : teamId
  }

  function getSkillNameById(skillId: string): string {
    const skill = skills?.find((s) => s.id === skillId)
    return skill ? skill.name : skillId
  }

  if (!student) return null

  if (isTeamsPending || isSkillsPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isTeamsError || isSkillsError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchTeams()
          refetchSkills()
        }}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[650px] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='text-xl flex items-center gap-2'>
            <span className='font-semibold'>
              {student.firstName} {student.lastName}
            </span>
            <Badge variant='outline' className='ml-2'>
              {student.email}
            </Badge>
          </DialogTitle>
          <DialogDescription>Skills and Project Preferences Details</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className='space-y-6 overflow-auto'>
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <Award className='h-5 w-5 text-primary' />
              <h3 className='text-lg font-medium'>Skills & Proficiency</h3>
            </div>

            {student.skills && student.skills.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {student.skills.map((skill, index) => (
                  <Card key={index} className='overflow-hidden'>
                    <CardContent className='p-3'>
                      <div className='flex justify-between items-center'>
                        <div className='font-medium'>{getSkillNameById(skill.id)}</div>
                        <ProficiencyBadge proficiency={skill.proficiency} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className='text-sm text-muted-foreground italic'>No skills provided</p>
            )}
          </div>

          <div>
            <div className='flex items-center gap-2 mb-3'>
              <BookOpen className='h-5 w-5 text-primary' />
              <h3 className='text-lg font-medium'>Project Preferences</h3>
            </div>

            {student.projectPreferences && student.projectPreferences.length > 0 ? (
              <ScrollArea className='h-[250px] rounded-md border'>
                <div className='p-4 space-y-4'>
                  {student.projectPreferences.map((preference, index) => (
                    <Card key={index} className='overflow-hidden'>
                      <CardContent className='p-3'>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2'>
                            <div className='bg-muted w-7 h-7 rounded-full flex items-center justify-center font-medium text-sm'>
                              {index + 1}
                            </div>
                            <div className='font-medium'>
                              {getTeamNameById(preference.projectId)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className='text-sm text-muted-foreground italic'>
                No project preferences submitted
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ProficiencyBadge({ proficiency }: { proficiency: string }) {
  let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'outline'
  let color = 'text-muted-foreground'

  switch (proficiency.toLowerCase()) {
    case 'expert':
      variant = 'default'
      color = 'text-destructive'
      break
    case 'advanced':
      variant = 'default'
      color = 'text-primary-foreground'
      break
    case 'intermediate':
      variant = 'secondary'
      color = 'text-secondary-foreground'
      break
    case 'beginner':
      variant = 'outline'
      color = 'text-muted-foreground'
      break
    default:
      break
  }

  return (
    <Badge variant={variant} className={color}>
      {proficiency}
    </Badge>
  )
}
