import { useParams } from 'react-router-dom'

import { TriangleAlert } from 'lucide-react'

import { useCourseStore } from '@tumaet/prompt-shared-state'
import { Alert, AlertDescription, AlertTitle } from '@tumaet/prompt-ui-components'

interface SelfAndPeerAssessmentDataShellProps {
  children: React.ReactNode
}

export const SelfAndPeerAssessmentDataShell = ({
  children,
}: SelfAndPeerAssessmentDataShellProps) => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>Your are not a student of this course.</AlertTitle>
          <AlertDescription>
            The following components are disabled because you are not a student of this course.
            Evaluations for self and peer assessments are currently only available for students.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}
