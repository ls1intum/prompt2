import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { AssessmentParticipationWithStudent } from '../assessment/interfaces/assessmentParticipationWithStudent'
import type { StudentAssessment } from '../assessment/interfaces/studentAssessment'

import { getCoursePhaseParticipations } from '../assessment/network/queries/getCoursePhaseParticipations'
import { getStudentAssessment } from '../assessment/network/queries/getStudentAssessment'
import { getLevelConfig } from '../assessment/pages/utils/getLevelConfig'

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
    // align with useGetCoursePhaseParticipations hook
    queryKey: ['participations', coursePhaseId],
    queryFn: () => getCoursePhaseParticipations(coursePhaseId),
  })

  const courseParticipationID = useMemo(() => {
    if (!participations) return null
    return participations.find((p) => p.student?.id === studentId)?.courseParticipationID ?? null
  }, [participations, studentId])

  const { data: studentAssessment, isPending: isAssessmentPending } = useQuery<StudentAssessment>({
    // align with useGetStudentAssessment hook
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
  const gradeSuggestion = completion.gradeSuggestion ?? '-'
  const comment = completion.comment || '-'
  const author = completion.author || '-'
  const levelTitle = getLevelConfig(studentAssessment.studentScore.scoreLevel).title
  const scoreNumeric = studentAssessment.studentScore.scoreNumeric

  return (
    <div className='text-sm space-y-1'>
      <div>
        <span className='text-muted-foreground'>Assessment Score: </span>
        <span className='font-medium'>{scoreNumeric}</span>
        <span className='text-muted-foreground'> · Level: </span>
        <span className='font-medium'>{levelTitle}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Status: </span>
        <span className='font-medium'>{completionStatus}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Completed at: </span>
        <span className='font-medium'>{completedAt}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Grade suggestion: </span>
        <span className='font-medium'>{gradeSuggestion}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Author: </span>
        <span className='font-medium'>{author}</span>
      </div>
      <div>
        <span className='text-muted-foreground'>Comment: </span>
        <span className='font-medium'>{comment}</span>
      </div>
    </div>
  )
}
