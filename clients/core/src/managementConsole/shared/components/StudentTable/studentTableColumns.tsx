import {
  StudentCourseParticipation,
  StudentWithCourses,
} from '@core/network/queries/getStudentsWithCourses'
import { StudentCoursePreview } from './components/StudentCoursePreview'
import { ColumnDef, Row } from '@tanstack/react-table'

export const studentTableColumns: ColumnDef<StudentWithCourses>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
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
    id: 'courses',
    header: 'Courses',
    enableSorting: false,

    accessorFn: (row: StudentWithCourses) => row.courses.map((c) => c.courseName).join(' '),

    cell: ({ row }) => (
      <div className='flex gap-2'>
        {row.original.courses.map((scp: StudentCourseParticipation) => (
          <StudentCoursePreview studentCourseParticipation={scp} key={scp.courseId + row.id} />
        ))}
      </div>
    ),

    filterFn: (row: Row<StudentWithCourses>, _columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true

      return row.original.courses.some((course) => filterValue.includes(course.courseName))
    },
  },
]
