import { ColumnDef } from '@tanstack/react-table'
import translations from '@/lib/translations.json'
import { SortableHeader } from './SortableHeader'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { getGenderString } from '@/interfaces/gender'
import { Checkbox } from '@/components/ui/checkbox'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { numericRangeFilter } from '../../utils/numericRangeFilter'
import { AdditionalScore } from '@/interfaces/additional_score'
import { ActionMenu } from './menus/ActionMenu'

export const columns = (
  onViewApplication: (id: string) => void,
  onDeleteApplication: (coursePhaseParticipationID: string) => void,
  additionalScores: AdditionalScore[],
): ColumnDef<ApplicationParticipation>[] => {
  let additionalScoreColumns: ColumnDef<ApplicationParticipation>[] = []
  if (additionalScores.length > 0) {
    additionalScoreColumns = additionalScores.map((additionalScore) => {
      return {
        id: additionalScore.key,
        accessorFn: (row) => row.meta_data?.[additionalScore.key] ?? null,
        header: ({ column }) => <SortableHeader column={column} title={additionalScore.name} />,
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
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.student.first_name.toLowerCase() || ''
        const valueB = rowB.original.student.first_name.toLowerCase() || ''
        return valueA.localeCompare(valueB)
      },
    },
    {
      id: 'last_name',
      accessorKey: 'student.last_name',
      header: ({ column }) => <SortableHeader column={column} title='Last Name' />,
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.student.last_name.toLowerCase() || ''
        const valueB = rowB.original.student.last_name.toLowerCase() || ''
        return valueA.localeCompare(valueB)
      },
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
      filterFn: (row, columnId, filterValue) => {
        const rowScore = row.getValue<number | null>(columnId) // row.original.score
        if (!filterValue || typeof filterValue !== 'object') return true
        return numericRangeFilter(rowScore, filterValue)
      },
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
          <ActionMenu
            onViewApplication={() => onViewApplication(row.original.id)}
            onDeleteApplication={() => onDeleteApplication(row.original.id)}
          />
        )
      },
    },
  ]
}
