import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import translations from '@/lib/translations.json'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SortableHeader = ({ column, title }: { column: any; title: string }) => {
  return (
    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {title}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className='ml-2 h-4 w-4' />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className='ml-2 h-4 w-4' />
      ) : (
        <ArrowUpDown className='ml-2 h-4 w-4' />
      )}
    </Button>
  )
}

export const columns: ColumnDef<CoursePhaseParticipationWithStudent>[] = [
  {
    accessorKey: 'student.first_name',
    header: ({ column }) => <SortableHeader column={column} title='First Name' />,
  },
  {
    accessorKey: 'student.last_name',
    header: ({ column }) => <SortableHeader column={column} title='Last Name' />,
  },
  {
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
    accessorKey: 'student.email',
    header: ({ column }) => <SortableHeader column={column} title='Email' />,
  },
  {
    accessorKey: 'student.matriculation_number',
    header: ({ column }) => <SortableHeader column={column} title='Matriculation Number' />,
  },
  {
    accessorKey: 'student.university_login',
    header: ({ column }) => (
      <SortableHeader column={column} title={translations.university['login-name']} />
    ),
  },
]
