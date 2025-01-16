import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, FileIcon as FileUser, Mic } from 'lucide-react'
import { getStudyDegreeString } from '@/interfaces/study_degree'
import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { getGravatarUrl } from '@/lib/getGravatarUrl'
import { getStatusColor } from '@/lib/getStatusColor'

interface StudentCardProps {
  participation: CoursePhaseParticipationWithStudent
}

export function StudentCard({ participation }: StudentCardProps) {
  const assessementScore = participation.prev_meta_data?.applicationScore ?? 'N/A'
  const interviewScore = participation.meta_data?.interviewScore ?? 'Not assessed'

  return (
    <Card className='h-full relative overflow-hidden'>
      {/* Top colored bar */}
      <div className={`h-20 ${getStatusColor(participation.pass_status)}`} />

      {/* Avatar: Positioned to overlap the colored background */}
      <Avatar className='absolute w-24 h-24 border-4 border-background rounded-full transform -translate-y-1/2 left-1/2 translate-x-1/2'>
        <AvatarImage
          src={getGravatarUrl(participation.student.email)}
          alt={participation.student.last_name}
        />
        <AvatarFallback className='rounded-full font-bold text-lg'>
          {participation.student.first_name[0]}
          {participation.student.last_name[0]}
        </AvatarFallback>
      </Avatar>

      <CardHeader className='pt-16'>
        <CardTitle className='text-center'>
          {participation.student.first_name} {participation.student.last_name}
        </CardTitle>
      </CardHeader>

      {/* Body content */}
      <CardContent className='grid gap-2 mt-2'>
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
        <div className='flex items-center gap-2'>
          <FileUser className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>Appl. Score: {assessementScore}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Mic className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>Interview Score: {interviewScore}</span>
        </div>
      </CardContent>
    </Card>
  )
}
