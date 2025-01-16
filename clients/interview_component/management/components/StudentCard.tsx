import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, FileIcon as FileUser, Mic } from 'lucide-react'
import { getStudyDegreeString } from '@/interfaces/study_degree'
import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getGravatarUrl } from '@/lib/getGravatarUrl'
import { getStatusColor } from '@/lib/getStatusColor'
import { Separator } from '@/components/ui/separator'

interface StudentCardProps {
  participation: CoursePhaseParticipationWithStudent
}

export function StudentCard({ participation }: StudentCardProps) {
  const assessmentScore = participation.prev_meta_data?.applicationScore ?? 'N/A'
  const interviewScore = participation.meta_data?.interviewScore ?? 'Not assessed'

  return (
    <Card className='h-full relative overflow-hidden'>
      <div className={`h-20 ${getStatusColor(participation.pass_status)}`} />

      <div className='mb-8'>
        <Avatar className='absolute w-24 h-24 border-4 border-background rounded-full transform left-3 -translate-y-1/2'>
          <AvatarImage
            src={getGravatarUrl(participation.student.email)}
            alt={participation.student.last_name}
          />
          <AvatarFallback className='rounded-full font-bold text-lg'>
            {participation.student.first_name[0]}
            {participation.student.last_name[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      <CardHeader>
        <CardTitle className='text-left'>
          {participation.student.first_name} {participation.student.last_name}
        </CardTitle>
      </CardHeader>

      <CardContent className='grid gap-2'>
        <div className='flex items-center gap-2'>
          <GraduationCap className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>
            {getStudyDegreeString(participation.student.study_degree)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <BookOpen className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>{participation.student.study_program}</span>
        </div>
        <Separator />

        <div className='grid gap-2'>
          <h4 className='text-sm font-semibold'>Scores</h4>
          <div className='grid gap-2 sm:grid-cols-2'>
            <div className='flex items-center gap-3'>
              <FileUser className='h-4 w-4 text-muted-foreground mr-2' />
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
