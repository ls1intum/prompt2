import React from 'react'
import { CoursePhaseStudentIdentifierProps } from '@/interfaces/studentDetail'

export const StudentDetail: React.FC<CoursePhaseStudentIdentifierProps> = ({
  studentId,
  coursePhaseId,
  courseId,
  courseParticipationId,
}) => {
  console.log(studentId, coursePhaseId, courseId, courseParticipationId)
  return <></>
}
