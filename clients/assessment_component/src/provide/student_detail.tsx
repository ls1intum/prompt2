import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { AssessmentParticipationWithStudent } from '../assessment/interfaces/assessmentParticipationWithStudent'
import type { StudentAssessment } from '../assessment/interfaces/studentAssessment'

import { getCoursePhaseParticipations } from '../assessment/network/queries/getCoursePhaseParticipations'
import { getStudentAssessment } from '../assessment/network/queries/getStudentAssessment'
import { GradeSuggestionBadge } from '../assessment/pages/components/badges'

export interface CoursePhaseStudentIdentifierProps {
  studentId: string
  coursePhaseId: string
  courseId: string
}

export const StudentDetail: React.FC<CoursePhaseStudentIdentifierProps> = ({
  studentId,
  coursePhaseId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId: _courseId,
}) => {
  const { data: participations, isPending: isParticipationsPending } = useQuery<
    AssessmentParticipationWithStudent[]
  >({
    queryKey: ['participations', coursePhaseId],
    queryFn: () => getCoursePhaseParticipations(coursePhaseId),
  })

  const courseParticipationID = useMemo(() => {
    if (!participations) return null
    return participations.find((p) => p.student?.id === studentId)?.courseParticipationID ?? null
  }, [participations, studentId])

  const { data: studentAssessment, isPending: isAssessmentPending } = useQuery<StudentAssessment>({
    queryKey: ['assessments', coursePhaseId, courseParticipationID],
    queryFn: () => getStudentAssessment(coursePhaseId, courseParticipationID ?? ''),
    enabled: Boolean(courseParticipationID),
  })

  const isPending =
    isParticipationsPending || (Boolean(courseParticipationID) && isAssessmentPending)

  if (isPending) return null
  if (!courseParticipationID || !studentAssessment) return null

  const completion = studentAssessment.assessmentCompletion
  const completionStatus = completion.completed ? 'Completed' : 'Not completed'
  const completedAt = completion.completedAt
    ? new Date(completion.completedAt).toLocaleString()
    : '-'
  const comment = completion.comment || '-'
  const author = completion.author || '-'

  return (
    <div className='grid grid-cols-2 gap-y-4 gap-x-4'>
      <div className='flex flex-col min-h-[92px]'>
        <div className='text-muted-foreground text-sm'>{completionStatus}</div>
        {completionStatus === 'Completed' && (
          <div className='font-medium break-words'>{completedAt}</div>
        )}
        <div className='mt-1' />
        <GradeSuggestionBadge gradeSuggestion={completion.gradeSuggestion} text={true} />
      </div>

      <div className='flex flex-col items-end text-right min-h-[92px]'>
        <div>
          <h4 className='text-muted-foreground text-sm'>Author</h4>
          <div className='font-medium'>{author}</div>
        </div>
      </div>

      <div className='col-span-2 mt-2 space-y-2'>
        <hr />
        <div>
          <h4 className='text-muted-foreground text-sm mb-1'>Comment</h4>
          <div style={{ maxWidth: '330px' }} className='whitespace-pre-wrap break-words'>
            {comment}
          </div>
        </div>
      </div>
    </div>
  )
}
