import { ColumnDef } from '@tanstack/react-table'
import translations from '@/lib/translations.json'
import { SortableHeader } from '@/components/table/SortableHeader'
import { getStatusBadge } from '@/utils/getStatusBadge'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { Checkbox } from '@tumaet/prompt-ui-components'

interface ColumnDefProps {
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
}

export const columns = ({
  prevDataKeys,
  restrictedDataKeys,
  studentReadableDataKeys,
}: ColumnDefProps): ColumnDef<CoursePhaseParticipationWithStudent>[] => {
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
      id: 'firstName', // required for filter bar
      accessorKey: 'student.firstName',
      header: ({ column }) => <SortableHeader column={column} title='First Name' />,
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.student.firstName.toLowerCase() || ''
        const valueB = rowB.original.student.firstName.toLowerCase() || ''
        return valueA.localeCompare(valueB)
      },
    },
    {
      id: 'lastName',
      accessorKey: 'student.lastName',
      header: ({ column }) => <SortableHeader column={column} title='Last Name' />,
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.student.lastName.toLowerCase() || ''
        const valueB = rowB.original.student.lastName.toLowerCase() || ''
        return valueA.localeCompare(valueB)
      },
    },
    {
      id: 'passStatus',
      accessorKey: 'passStatus',
      header: ({ column }) => <SortableHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const passStatus = row.original.passStatus
        return getStatusBadge(passStatus)
      },
      sortingFn: (rowA, rowB) => {
        const statusOrder = ['passed', 'not_assessed', 'failed']
        const statusA = rowA.original.passStatus
        const statusB = rowB.original.passStatus
        return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
      },
      filterFn: (row, columnId, filterValue) => {
        return filterValue.includes(row.original.passStatus)
      },
    },
    {
      id: 'matriculationNumber',
      accessorKey: 'student.matriculationNumber',
      header: ({ column }) => <SortableHeader column={column} title='Mat Number' />,
    },
    {
      id: `universityLogin`,
      accessorKey: 'student.universityLogin',
      header: ({ column }) => (
        <SortableHeader column={column} title={translations.university['login-name']} />
      ),
    },
    ...prevDataKeys.map((key) => ({
      id: key,
      accessorKey: `prevData.${key}`,
      header: ({ column }) => <SortableHeader column={column} title={key} />,
    })),
    ...restrictedDataKeys.map((key) => ({
      id: key,
      accessorKey: `restrictedData.${key}`,
      header: ({ column }) => <SortableHeader column={column} title={key} />,
    })),
    ...studentReadableDataKeys.map((key) => ({
      id: key,
      accessorKey: `studentReadableData.${key}`,
      header: ({ column }) => <SortableHeader column={column} title={key} />,
    })),
  ]
}
