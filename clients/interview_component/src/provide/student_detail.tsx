import React from 'react'

export interface CoursePhaseStudentIdentifierProps {
  studentId: string
  coursePhaseId: string
  courseId: string
}

export const StudentDetail: React.FC<CoursePhaseStudentIdentifierProps> = ({
  studentId,
  coursePhaseId,
  courseId,
}) => {
  return (
    <div className='p-4 border rounded-md'>
      <h2 className='text-lg font-semibold mb-2'>Interview Component - Student Detail</h2>
      <ul className='text-sm space-y-1'>
        <li>
          <strong>Student ID:</strong> {studentId}
        </li>
        <li>
          <strong>Course Phase ID:</strong> {coursePhaseId}
        </li>
        <li>
          <strong>Course ID:</strong> {courseId}
        </li>
      </ul>
      <p className='mt-3 text-muted-foreground'>Placeholder component</p>
    </div>
  )
}
