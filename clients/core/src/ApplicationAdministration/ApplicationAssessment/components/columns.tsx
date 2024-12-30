import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { ColumnDef } from '@tanstack/react-table'
import translations from '@/lib/translations.json'
import { SortableHeader } from './SortableHeader'
import { getStatusBadge } from '../utils/getStatusBadge'
import { getGenderString } from '@/interfaces/gender'

export const columns: ColumnDef<CoursePhaseParticipationWithStudent>[] = [
  {
    id: 'first_name', // required for filter bar
    accessorKey: 'student.first_name',
    header: ({ column }) => <SortableHeader column={column} title='First Name' />,
  },
  {
    id: 'last_name',
    accessorKey: 'student.last_name',
    header: ({ column }) => <SortableHeader column={column} title='Last Name' />,
  },
  {
    id: 'pass_status',
    accessorKey: 'pass_status',
    header: ({ column }) => <SortableHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const passStatus = row.original.pass_status
      return getStatusBadge(passStatus)
    },
    sortingFn: (rowA, rowB) => {
      const statusOrder = ['passed', 'not_assessed', 'failed']
      const statusA = rowA.original.pass_status
      const statusB = rowB.original.pass_status
      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
    },
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.original.pass_status)
    },
  },
  {
    id: 'email',
    accessorKey: 'student.email',
    header: ({ column }) => <SortableHeader column={column} title='Email' />,
  },
  {
    id: 'matriculation_number',
    accessorKey: 'student.matriculation_number',
    header: ({ column }) => <SortableHeader column={column} title='Matriculation Number' />,
  },
  {
    id: `university_login`,
    accessorKey: 'student.university_login',
    header: ({ column }) => (
      <SortableHeader column={column} title={translations.university['login-name']} />
    ),
  },
  {
    id: `gender`,
    accessorKey: 'student.gender',
    header: ({ column }) => <SortableHeader column={column} title='Gender' />,
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.original.student.gender)
    },
    cell: ({ row }) => {
      const gender = row.original.student.gender
      return getGenderString(gender)
    },
  },
]
