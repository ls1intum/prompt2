import { CourseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { useParams } from 'react-router-dom'
import { StudentCourseEnrollment } from '../shared/components/StudentDetail/StudentCourseEnrollment'
import { useStudent } from '@core/network/hooks/useStudent'
import { useStudentEnrollments } from '@core/network/hooks/useStudentEnrollments'
import { Loader2 } from 'lucide-react'
import { StudentProfile } from '@/components/StudentProfile'
import { PassStatus } from '@tumaet/prompt-shared-state'

export const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>()

  const student = useStudent(studentId)
  const enrollments = useStudentEnrollments(studentId)

  return (
    <div>
      <div className='flex flex-col w-full justify-between gap-8'>
        <div className='flex flex-col gap-y-2 text-sm'>
          {student.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          {student.isSuccess && (
            <StudentProfile student={student.data} status={PassStatus.PASSED} />
          )}
        </div>

        <div className='flex flex-col gap-5'>
          {enrollments.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          {enrollments.isSuccess &&
            enrollments.data?.courses.map((ce: CourseEnrollment) => (
              <div className='flex gap-4' key={ce.courseId}>
                <StudentCourseEnrollment courseEnrollment={ce} studentId={studentId!} />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
