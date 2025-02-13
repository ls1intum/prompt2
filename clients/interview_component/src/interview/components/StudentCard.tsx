import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, Mic, FileUserIcon } from 'lucide-react'
import {
  getStudyDegreeString,
  CoursePhaseParticipationWithStudent,
} from '@tumaet/prompt-shared-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getGravatarUrl } from '@/lib/getGravatarUrl'
import { getStatusColor } from '@/lib/getStatusColor'
import { Separator } from '@/components/ui/separator'
import { InterviewSlot } from '../interfaces/InterviewSlots'
import { Badge } from '@/components/ui/badge'

interface StudentCardProps {
  participation: CoursePhaseParticipationWithStudent
  interviewSlot?: InterviewSlot
}

export function StudentCard({ participation, interviewSlot }: StudentCardProps) {
  const assessmentScore = participation.prevData?.applicationScore ?? 'N/A'
  const interviewScore = participation.restrictedData?.score ?? 'N/A'

  return (
    <Card className='h-full relative overflow-hidden'>
      <div className={`h-16 ${getStatusColor(participation.passStatus)}`} />

      <div className='mb-8'>
        <Avatar className='absolute w-24 h-24 border-4 border-background rounded-full transform left-3 -translate-y-1/2'>
          <AvatarImage
            src={getGravatarUrl(participation.student.email)}
            alt={participation.student.lastName}
          />
          <AvatarFallback className='rounded-full font-bold text-lg'>
            {participation.student.firstName[0]}
            {participation.student.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className='absolute right-0'>
          {interviewSlot && (
            <Badge className='ml-auto mr-2 mt-2' variant='outline'>
              #{interviewSlot.index}: {interviewSlot.startTime} - {interviewSlot.endTime}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <CardTitle className='text-left'>
          {participation.student.firstName} {participation.student.lastName}
        </CardTitle>
      </CardHeader>

      <CardContent className='grid gap-2'>
        <div className='flex items-center gap-2'>
          <GraduationCap className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{getStudyDegreeString(participation.student.studyDegree)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{participation.student.studyProgram}</span>
        </div>
        <Separator />

        <div className='grid gap-2'>
          <h4 className='text-sm font-semibold'>Scores</h4>
          <div className='grid gap-2 sm:grid-cols-2'>
            <div className='flex items-center gap-3'>
              <FileUserIcon className='h-4 w-4 text-muted-foreground mr-2' />
              <div className='flex flex-col'>
                <span className='text-xs text-muted-foreground'>Application</span>
                <span className='text-sm'>{assessmentScore}</span>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Mic className='h-4 w-4 text-muted-foreground mr-2' />
              <div className='flex flex-col'>
                <span className='text-xs text-muted-foreground'>Interview</span>
                <span className='text-sm font-medium'>{interviewScore}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
