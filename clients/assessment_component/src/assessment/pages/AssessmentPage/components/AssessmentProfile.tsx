import { Book, Calendar, GraduationCap } from 'lucide-react'
import AssessmentStatusBadge from './AssessmentStatusBadge'
import { StudentScoreBadge } from '../../components/StudentScoreBadge'
import { GradeSuggestionBadge } from '../../components/GradeSuggestionBadge'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

import { Card, CardContent, CardHeader } from '@tumaet/prompt-ui-components'

import type { StudentAssessment } from '../../../interfaces/studentAssessment'

interface AssessmentProfileProps {
  participant: CoursePhaseParticipationWithStudent
  studentAssessment: StudentAssessment
  remainingAssessments: number
}

export const AssessmentProfile = ({
  participant,
  studentAssessment,
  remainingAssessments,
}: AssessmentProfileProps): JSX.Element => {
  return (
    <>
      <Card className='relative overflow-hidden'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row items-center gap-3'>
            <div className='flex-1 text-left'>
              <div className='flex flex-col sm:flex-row items-center gap-1'>
                <h1 className='text-2xl font-bold mr-2'>
                  {participant.student.firstName} {participant.student.lastName}
                </h1>

                <div className='flex items-center gap-1'>
                  <AssessmentStatusBadge
                    remainingAssessments={remainingAssessments}
                    isFinalized={studentAssessment.assessmentCompletion.completed}
                  />
                  {studentAssessment.assessmentCompletion && (
                    <GradeSuggestionBadge
                      gradeSuggestion={studentAssessment.assessmentCompletion.gradeSuggestion}
                    />
                  )}
                  {studentAssessment.assessments.length > 0 && (
                    <StudentScoreBadge scoreLevel={studentAssessment.studentScore.scoreLevel} />
                  )}
                </div>
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
                {participant.student.studyDegree
                  ? participant.student.studyDegree.charAt(0).toUpperCase() +
                    participant.student.studyDegree.slice(1)
                  : 'N/A'}
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
    </>
  )
}
