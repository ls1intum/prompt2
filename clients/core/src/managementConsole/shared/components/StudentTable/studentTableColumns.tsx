import {
  StudentCourseParticipation,
  StudentWithCourses,
} from '@core/network/queries/getStudentsWithCourses'
import { CellContext, Row } from '@tanstack/react-table'
import { StudentCoursePreview } from './components/StudentCoursePreview'

export const studentTableColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'currentSemester',
    header: 'Semester',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'studyProgram',
    header: 'Program',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'courses',
    header: 'Courses',
    cell: (cellContext: CellContext<StudentWithCourses, unknown>) => (
      <div className='flex gap-2'>
        {cellContext
          .getValue<StudentCourseParticipation[]>()
          .map((scp: StudentCourseParticipation) => (
            <StudentCoursePreview
              studentCourseParticipation={scp}
              key={scp.courseId + cellContext.row.id}
            />
          ))}
      </div>
    ),
    filterFn: (row: Row<StudentWithCourses>, columnId: string, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true

      const courses = row.getValue<StudentCourseParticipation[]>(columnId)

      return courses.some((course) => filterValue.includes(course.courseName))
    },
  },
]
