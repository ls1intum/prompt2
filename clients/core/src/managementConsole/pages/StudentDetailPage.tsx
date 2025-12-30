import {
  CourseEnrollment,
  getStudentEnrollments,
  StudentEnrollments,
} from '@core/network/queries/getStudentEnrollments'
import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { StudentCourseEnrollment } from '../shared/components/StudentDetail/StudentCourseEnrollment'

export const StudentDetailPage = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const [s, setStudentEnrollments] = useState<StudentEnrollments>()

  useEffect(() => {
    if (studentId == null) {
      return
    }
    const fetchStudents = async () => {
      const se = await getStudentEnrollments(studentId)
      setStudentEnrollments(se)
    }
    fetchStudents()
  }, [studentId])

  return (
    <div>
      <ManagementPageHeader>
        {s?.firstName} {s?.lastName}
      </ManagementPageHeader>
      <div className='flex w-full justify-between gap-4'>
        {s && (
          <>
            <div className='flex flex-col gap-5'>
              {s.courses.map((c: CourseEnrollment) => (
                <div className='flex gap-4' key={c.courseId}>
                  <StudentCourseEnrollment sce={c} />
                </div>
              ))}
            </div>
            <div className='flex flex-col gap-y-2 text-sm mr-5'>
              <div>
                <span className='font-semibold'>Name</span>
                <div>
                  {s.firstName} {s.lastName}
                </div>
              </div>

              <div>
                <span className='font-semibold'>ID</span>
                <div>
                  {s.matriculationNumber} / {s.universityLogin}
                </div>
              </div>

              <div>
                <span className='font-semibold'>Email</span>
                <div className='truncate'>{s.email}</div>
              </div>

              <div>
                <span className='font-semibold'>Study Program</span>
                <div>{s.currentSemester ? s.currentSemester + '. Semester' : ''}</div>
                <div>
                  {s.studyProgram} ({s.studyDegree})
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
