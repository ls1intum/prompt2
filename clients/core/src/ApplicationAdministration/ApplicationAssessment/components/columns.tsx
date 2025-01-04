import { ColumnDef } from '@tanstack/react-table'
import translations from '@/lib/translations.json'
import { SortableHeader } from './SortableHeader'
import { getStatusBadge } from '../utils/getStatusBadge'
import { getGenderString } from '@/interfaces/gender'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ApplicationParticipation } from '@/interfaces/application_participations'

export const columns = (
  onViewApplication: (id: string) => void,
  onDeleteApplication: (coursePhaseParticipationID: string) => void,
  additionalScores: string[],
): ColumnDef<ApplicationParticipation>[] => {
  let additionalScoreColumns: ColumnDef<ApplicationParticipation>[] = []
  if (additionalScores.length > 0) {
    additionalScoreColumns = additionalScores.map((scoreName) => {
      return {
        id: scoreName,
        accessorFn: (row) => row.meta_data?.[scoreName] ?? null,
        header: ({ column }) => <SortableHeader column={column} title={scoreName} />,
      }
    })
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(event) => {
            event.stopPropagation()
            row.toggleSelected()
          }}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      id: 'score',
      accessorKey: 'score',
      header: ({ column }) => <SortableHeader column={column} title='Score' />,
    },
    ...additionalScoreColumns,
    {
      id: 'email',
      accessorKey: 'student.email',
      header: ({ column }) => <SortableHeader column={column} title='Email' />,
    },
    {
      id: 'matriculation_number',
      accessorKey: 'student.matriculation_number',
      header: ({ column }) => <SortableHeader column={column} title='Mat Number' />,
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
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='h-8 w-8 p-0 hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring'
              >
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel className='font-normal'>
                <span className='font-semibold'>Application Actions</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onViewApplication(row.original.id)
                }}
                className='flex items-center cursor-pointer'
              >
                <Eye className='mr-2 h-4 w-4' />
                <span>View application</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteApplication(row.original.id)
                }}
                className='flex items-center cursor-pointer text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                <span>Delete application</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
