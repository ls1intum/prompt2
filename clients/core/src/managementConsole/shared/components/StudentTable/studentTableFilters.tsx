import { StudentWithCourses } from '@core/network/queries/getStudentsWithCourses'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  TableFilter,
} from '@tumaet/prompt-ui-components'
import { StudentCoursePreview } from './components/StudentCoursePreview'
import { InstructorNoteTag } from '../InstructorNote/InstructorNoteTag'
import { NoteTagColor } from '../../interfaces/InstructorNote'

export function getStudentTableFilters(studentsWithCourses: StudentWithCourses[]): TableFilter[] {
  const tagOptions = Array.from(
    new Map(studentsWithCourses.flatMap((s) => s.noteTags).map((t) => [t.id, t])).values(),
  )

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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Course</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {courseOptions.map((course) => (
                <DropdownMenuCheckboxItem
                  key={course.courseId}
                  checked={selected.includes(course.courseName)}
                  onClick={() => toggleCourse(course.courseName)}
                >
                  <StudentCoursePreview studentCourseParticipation={course} />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )
      },
    },
    {
      type: 'custom',
      id: 'noteTags',
      label: 'Tag',
      badge: {
        label: 'Tag',
        displayValue: (filtervalue: unknown) =>
          tagOptions.find((t) => t.id === filtervalue)?.name ?? String(filtervalue),
      },
      render: ({ column }) => {
        const selected = (column.getFilterValue() as string[]) ?? []

        const toggleTag = (tagId: string) => {
          const next = selected.includes(tagId)
            ? selected.filter((id) => id !== tagId)
            : [...selected, tagId]

          column.setFilterValue(next.length === 0 ? undefined : next)
        }

        return (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Tag</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {tagOptions.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selected.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                >
                  <InstructorNoteTag
                    tag={{ id: tag.id, name: tag.name, color: tag.color as NoteTagColor }}
                  />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )
      },
    },
  ]
}
