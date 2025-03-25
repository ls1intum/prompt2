import { SortableHeader } from '@/components/table/SortableHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { getStatusBadge } from '@/utils/getStatusBadge'
import { getChallengeStatusBadge } from './utils/getChallengeStatusBadge'

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'participation.student.lastName',
    header: ({ column }) => <SortableHeader column={column} title='Name' />,
    cell: ({ row }) =>
      `${row.original.participation?.student?.firstName || ''} ${row.original.participation?.student?.lastName || ''}`,
    sortingFn: (rowA, rowB) => {
      const valueA = `${
        rowA.original.participation?.student?.lastName?.toLowerCase() || ''
      } ${rowA.original.participation?.student?.firstName?.toLowerCase() || ''}`
      const valueB = `${
        rowB.original.participation?.student?.lastName?.toLowerCase() || ''
      } ${rowB.original.participation?.student?.firstName?.toLowerCase() || ''}`
      return valueA.localeCompare(valueB)
    },
  },
  {
    accessorKey: 'participation.student.email',
    header: ({ column }) => <SortableHeader column={column} title='Mail' />,
    cell: ({ row }) => row.original.participation?.student?.email || '',
  },
  {
    accessorKey: 'participation.passStatus',
    header: ({ column }) => <SortableHeader column={column} title='Pass Status' />,
    cell: ({ row }) => getStatusBadge(row.original.participation?.passStatus),
  },
  {
    accessorKey: 'challengeStatus',
    header: ({ column }) => <SortableHeader column={column} title='Challenge Status' />,
    cell: ({ row }) => getChallengeStatusBadge(row.original.profile),
    sortingFn: (rowA, rowB) => {
      if (rowA.original.profile === rowB.original.profile) {
        return 0
      } else if (rowA.original.profile?.hasPassed) {
        return 1
      }
      return -1
    },
  },
  {
    accessorKey: 'attempts',
    header: ({ column }) => <SortableHeader column={column} title='Attempts' />,
    cell: ({ row }) => row.original.profile?.attempts ?? '-',
    sortingFn: (rowA, rowB) => {
      const valueA = rowA.original.profile?.attempts ?? -1
      const valueB = rowB.original.profile?.attempts ?? -1
      return valueA - valueB
    },
  },
]
