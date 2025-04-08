import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Book, Calendar, GraduationCap } from 'lucide-react'
import AssessmentStatusBadge from './AssessmentStatusBadge'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface AssessmentProfileProps {
  participant: CoursePhaseParticipationWithStudent
  remainingAssessments: number
}

export const AssessmentProfile = ({
  participant,
  remainingAssessments,
}: AssessmentProfileProps): JSX.Element => {
  return (
    <Card className='relative overflow-hidden'>
      <CardHeader>
        <div className='flex flex-col sm:flex-row items-center'>
          <div className='flex-1 text-center sm:text-left'>
            <div className='flex flex-col sm:flex-row sm:items-center'>
              <h1 className='text-2xl font-bold mr-3'>
                {participant.student.firstName} {participant.student.lastName}
              </h1>
              <AssessmentStatusBadge remainingAssessments={remainingAssessments} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
          <div className='flex items-center'>
            <Book className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Program:</strong>
            <span className='text-muted-foreground'>
              {participant.student.studyProgram || 'N/A'}
            </span>
          </div>
          <div className='flex items-center'>
            <GraduationCap className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Degree:</strong>
            <span className='text-muted-foreground'>
              {participant.student.studyDegree || 'N/A'}
            </span>
          </div>
          <div className='flex items-center'>
            <Calendar className='w-5 h-5 mr-2 text-primary' />
            <strong className='mr-2'>Semester:</strong>
            <span className='text-muted-foreground'>
              {participant.student.currentSemester || 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
