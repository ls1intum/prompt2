import { StudentWithCourses } from '@core/network/queries/getStudentsWithCourses'
import { DropdownMenuCheckboxItem, TableFilter } from '@tumaet/prompt-ui-components'
import { StudentCoursePreview } from './components/StudentCoursePreview'

export function getStudentTableFilters(studentsWithCourses: StudentWithCourses[]): TableFilter[] {
  return [
    {
      type: 'custom',
      id: 'courses',
      label: 'Course',
      render: ({ column }) => {
        const selected = (column.getFilterValue() as string[]) ?? []

        const courseOptions = Array.from(
          new Map(
            studentsWithCourses
              .flatMap((s) => s.courses)
              .filter((c) => c.courseName)
              .map((c) => [c.courseName, c]),
          ).values(),
        )

        const toggleCourse = (courseName: string) => {
          const next = selected.includes(courseName)
            ? selected.filter((c) => c !== courseName)
            : [...selected, courseName]

          column.setFilterValue(next.length === 0 ? undefined : next)
        }

        return (
          <div className='flex flex-col gap-1'>
            {courseOptions.map((course) => (
              <DropdownMenuCheckboxItem
                key={course.courseId}
                checked={selected.includes(course.courseName)}
                onClick={() => toggleCourse(course.courseName)}
              >
                <StudentCoursePreview studentCourseParticipation={course} />
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        )
      },
    },
  ]
}
