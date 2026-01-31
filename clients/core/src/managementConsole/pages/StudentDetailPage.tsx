import { CourseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { useParams } from 'react-router-dom'
import { StudentCourseEnrollment } from '../shared/components/StudentDetail/StudentCourseEnrollment'
import { useStudent } from '@core/network/hooks/useStudent'
import { useStudentEnrollments } from '@core/network/hooks/useStudentEnrollments'
import { Loader2 } from 'lucide-react'
import { StudentProfile } from '@/components/StudentProfile'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { InstructorNotes } from '../shared/components/InstructorNote/InstructorNotes'
import { StudentDetailContentLayout } from '../shared/components/StudentDetail/StudentDetailContentLayout'
import { CourseEnrollmentSummary } from '../shared/components/StudentDetail/CourseEnrollmentSummary'
import { EmptyPage } from '../shared/components/EmptyPage'

export const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>()

  const student = useStudent(studentId)
  const enrollments = useStudentEnrollments(studentId)

  if (!studentId) {
    return <EmptyPage message='Student not found' />
  }

  return (
    <div className='flex flex-col w-full justify-between gap-2'>
      <div className='flex flex-col gap-y-2 text-sm'>
        {student.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
        {student.isError && <p className='text-destructive'>Failed to load student data</p>}
        {student.isSuccess && <StudentProfile student={student.data} status={PassStatus.PASSED} />}
      </div>

      <StudentDetailContentLayout
        courseEnrollment={
          <div className='flex flex-col gap-5'>
            {enrollments.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
            {enrollments.isError && <p className='text-destructive'>Failed to load enrollments</p>}
            {enrollments.isSuccess && (
              <>
                {enrollments.data?.courses.map((ce: CourseEnrollment) => (
                  <div className='flex gap-4' key={ce.courseId}>
                    <StudentCourseEnrollment courseEnrollment={ce} studentId={studentId} />
                  </div>
                ))}
                <CourseEnrollmentSummary enrollments={enrollments.data?.courses || []} />
              </>
            )}
          </div>
        }
        instructorNotes={<InstructorNotes />}
      />
    </div>
  )
}
