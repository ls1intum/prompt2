import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { SortableHeader } from '@/components/table/SortableHeader'
import translations from '@/lib/translations.json'
import { getStatusBadge } from '@/utils/getStatusBadge'

// 1. SELECT COLUMN
const buildSelectionColumn = (): ColumnDef<CoursePhaseParticipationWithStudent> => ({
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
      onClick={(e) => {
        e.stopPropagation()
        row.toggleSelected()
      }}
      aria-label='Select row'
    />
  ),
  enableSorting: false,
  enableHiding: false,
})

// 2. DEFAULT COLUMNS
const buildStudentColumns = (): ColumnDef<CoursePhaseParticipationWithStudent>[] => [
  {
    id: 'firstName',
    accessorFn: (row) => row.student.firstName,
    header: ({ column }) => <SortableHeader column={column} title='First Name' />,
    sortingFn: (rowA, rowB) =>
      rowA.original.student.firstName.localeCompare(rowB.original.student.firstName),
  },
  {
    id: 'lastName',
    accessorFn: (row) => row.student.lastName,
    header: ({ column }) => <SortableHeader column={column} title='Last Name' />,
    sortingFn: (rowA, rowB) =>
      rowA.original.student.lastName.localeCompare(rowB.original.student.lastName),
  },
  {
    id: 'matriculationNumber',
    accessorFn: (row) => row.student.matriculationNumber,
    header: ({ column }) => <SortableHeader column={column} title='Mat Number' />,
  },
  {
    id: 'universityLogin',
    accessorFn: (row) => row.student.universityLogin,
    header: ({ column }) => (
      <SortableHeader column={column} title={translations.university['login-name']} />
    ),
  },
]

// 3. PASS STATUS COLUMN
const buildPassStatusColumn = (): ColumnDef<CoursePhaseParticipationWithStudent> => ({
  id: 'passStatus',
  accessorFn: (row) => row.passStatus,
  header: ({ column }) => <SortableHeader column={column} title='Status' />,
  cell: ({ row }) => getStatusBadge(row.original.passStatus),
  sortingFn: (rowA, rowB) => {
    const order = ['passed', 'not_assessed', 'failed']
    return order.indexOf(rowA.original.passStatus) - order.indexOf(rowB.original.passStatus)
  },
  filterFn: (row, _columnId, filterValue) => {
    return filterValue.includes(row.original.passStatus)
  },
})

// 4. DYNAMIC DATA COLUMNS (prev, restricted, readable)
const buildDynamicDataColumns = (keys: string[], prefix: string) =>
  keys.map(
    (key): ColumnDef<CoursePhaseParticipationWithStudent> => ({
      id: `${prefix}.${key}`,
      accessorFn: (row) => row[prefix]?.[key],
      header: ({ column }) => <SortableHeader column={column} title={key} />,
    }),
  )

// 5. MERGED COLUMNS
interface ColumnDefProps {
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
}

export const buildColumns = ({
  prevDataKeys,
  restrictedDataKeys,
  studentReadableDataKeys,
}: ColumnDefProps): ColumnDef<CoursePhaseParticipationWithStudent>[] => {
  return [
    buildSelectionColumn(),

    ...buildStudentColumns(),

    buildPassStatusColumn(),

    ...buildDynamicDataColumns(prevDataKeys, 'prevData'),
    ...buildDynamicDataColumns(restrictedDataKeys, 'restrictedData'),
    ...buildDynamicDataColumns(studentReadableDataKeys, 'studentReadableData'),
  ]
}
