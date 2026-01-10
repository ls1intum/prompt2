import { CourseEnrollment } from '@core/network/queries/getStudentEnrollments'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { useParams } from 'react-router-dom'
import { StudentCourseEnrollment } from '../shared/components/StudentDetail/StudentCourseEnrollment'
import { useStudent } from '@core/network/hooks/useStudent'
import { useStudentEnrollments } from '@core/network/hooks/useStudentEnrollments'
import { Loader2 } from 'lucide-react'

export const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>()

  const student = useStudent(studentId)
  const enrollments = useStudentEnrollments(studentId)

  return (
    <div>
      <ManagementPageHeader>
        {student.data?.firstName} {student.data?.lastName}
      </ManagementPageHeader>
      <div className='flex w-full justify-between gap-4'>
        <div className='flex flex-col gap-5'>
          {enrollments.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          {enrollments.isSuccess &&
            enrollments.data?.courses.map((c: CourseEnrollment) => (
              <div className='flex gap-4' key={c.courseId}>
                <StudentCourseEnrollment sce={c} />
              </div>
            ))}
        </div>
        <div className='flex flex-col gap-y-2 text-sm mr-5'>
          {student.isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          {student.isSuccess && (
            <>
              <div>
                <span className='font-semibold'>Name</span>
                <div>
                  {student.data?.firstName} {student.data?.lastName}
                </div>
              </div>

              <div>
                <span className='font-semibold'>ID</span>
                <div>
                  {student.data?.matriculationNumber} / {student.data?.universityLogin}
                </div>
              </div>

              <div>
                <span className='font-semibold'>Email</span>
                <div className='truncate'>{student.data?.email}</div>
              </div>

              <div>
                <span className='font-semibold'>Study Program</span>
                <div>
                  {student.data?.currentSemester
                    ? student.data?.currentSemester + '. Semester'
                    : ''}
                </div>
                <div>
                  {student.data?.studyProgram} ({student.data?.studyDegree})
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
