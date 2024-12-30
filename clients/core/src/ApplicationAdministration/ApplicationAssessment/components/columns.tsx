import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import translations from '@/lib/translations.json'
import { SortableHeader } from './SortableHeader'

export const columns: ColumnDef<CoursePhaseParticipationWithStudent>[] = [
  {
    id: 'first_NAme', // required for filter bar
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
      switch (passStatus) {
        case 'passed':
          return <Badge className='bg-green-500 hover:bg-green-500'>Accepted</Badge>
        case 'failed':
          return <Badge className='bg-red-500 hover:bg-red-500'>Rejected</Badge>
        case 'not_assessed':
          return <Badge className='bg-gray-500 hover:bg-gray-500'>Not Assessed</Badge>
        default:
          return <Badge className='bg-gray-500 hover:bg-gray-500'>Unknown</Badge>
      }
    },
    sortingFn: (rowA, rowB) => {
      const statusOrder = ['passed', 'not_assessed', 'failed']
      const statusA = rowA.original.pass_status
      const statusB = rowB.original.pass_status
      return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
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
]
