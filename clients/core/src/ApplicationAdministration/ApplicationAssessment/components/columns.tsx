import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<CoursePhaseParticipationWithStudent>[] = [
  {
    accessorKey: 'student.first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'student.last_name',
    header: 'Last Name',
  },
  {
    accessorKey: 'student.email',
    header: 'Email',
  },
  {
    accessorKey: 'pass_status',
    header: 'Status',
  },
]
