import { ColumnDef } from '@tanstack/react-table'
import translations from '@/lib/translations.json'
import { SortableHeader } from '@/components/table/SortableHeader'
import { getStatusBadge } from '../../utils/getStatusBadge'
import { getGenderString } from '@tumaet/prompt-shared-state'
import { ApplicationParticipation } from '../../../../interfaces/applicationParticipation'
import { numericRangeFilter } from '../../utils/numericRangeFilter'
import { AdditionalScore } from '../../../../interfaces/additionalScore/additionalScore'
import { ActionMenu } from './menus/ActionMenu'
import { VerticallyCenteredCheckbox } from '../../utils/VerticallyCenteredCheckbox'

export const columns = (
  onViewApplication: (courseParticipationID: string) => void,
  onDeleteApplication: (courseParticipationID: string) => void,
  additionalScores: AdditionalScore[],
): ColumnDef<ApplicationParticipation>[] => {
  let additionalScoreColumns: ColumnDef<ApplicationParticipation>[] = []
  if (additionalScores.length > 0) {
    additionalScoreColumns = additionalScores.map((additionalScore) => {
      return {
        id: additionalScore.key,
        accessorFn: (row) => row.restrictedData?.[additionalScore.key] ?? null,
        header: ({ column }) => <SortableHeader column={column} title={additionalScore.name} />,
      }
    })
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <VerticallyCenteredCheckbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <VerticallyCenteredCheckbox
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
    {
      id: `studyProgram`,
      accessorKey: 'student.studyProgram',
      header: ({ column }) => <SortableHeader column={column} title='Study Program' />,
    },
    {
      id: `studyDegree`,
      accessorKey: 'student.studyDegree',
      header: ({ column }) => <SortableHeader column={column} title='Study Degree' />,
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
            onViewApplication={() => onViewApplication(row.original.courseParticipationID)}
            onDeleteApplication={() => onDeleteApplication(row.original.courseParticipationID)}
          />
        )
      },
    },
  ]
}
