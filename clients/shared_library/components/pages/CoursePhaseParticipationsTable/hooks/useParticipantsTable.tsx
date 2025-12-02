// hooks/useParticipantsTable.ts
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  ColumnDef,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { buildColumns } from '../utils/buildColumns'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ExtraParticipationTableColumn } from '../interfaces/ExtraParticipationTableColumn'
import { ActionOnParticipants } from '../interfaces/ActionOnParticipants'
import { RowActionsMenu } from '../components/Actions/RowActionsMenu'

interface Props {
  participants: CoursePhaseParticipationWithStudent[]
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
  extraColumns?: ExtraParticipationTableColumn[]
  customActions?: ActionOnParticipants[]
  columnFilters?: ColumnFiltersState
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

export const useParticipantsTable = ({
  participants,
  prevDataKeys,
  restrictedDataKeys,
  studentReadableDataKeys,
  extraColumns = [],
  customActions = [],
  columnFilters: controlledColumnFilters,
  setColumnFilters: controlledSetColumnFilters,
}: Props) => {
  const [sorting, setSorting] = useState([{ id: 'lastName', desc: false }])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState({})

  // Use external columnFilters if provided
  const columnFilters = controlledColumnFilters ?? internalColumnFilters
  const setColumnFilters = controlledSetColumnFilters ?? setInternalColumnFilters

  // 1) base table columns
  const baseCols = useMemo(
    () =>
      buildColumns({
        prevDataKeys,
        restrictedDataKeys,
        studentReadableDataKeys,
      }),
    [prevDataKeys, restrictedDataKeys, studentReadableDataKeys],
  )

  // 2) extra data maps
  const extraDataMaps = useMemo(() => {
    const map: Record<string, Map<string, React.ReactNode>> = {}

    extraColumns.forEach((col) => {
      map[col.id] = new Map(col.extraData.map((d) => [d.courseParticipationID, d.value]))
    })

    return map
  }, [extraColumns])

  // 3) dynamic extra columns
  const dynamicExtraColumns: ColumnDef<CoursePhaseParticipationWithStudent>[] = useMemo(
    () =>
      extraColumns.map((col) => ({
        id: col.id,
        header: col.header,
        accessorFn: (row) => extraDataMaps[col.id]?.get(row.courseParticipationID) ?? '',
        enableSorting: col.enableSorting ?? false,
        enableColumnFilter: col.enableColumnFilter ?? false,
        cell: (info) => info.getValue(),
        sortingFn: col.sortingFn,
        filterFn: col.filterFn,
      })),
    [extraColumns, extraDataMaps],
  )

  // 4) rowActions column
  const rowActionsColumn: ColumnDef<CoursePhaseParticipationWithStudent> = useMemo(
    () => ({
      id: 'rowActions',
      header: '',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActionsMenu
            row={row.original}
            customActions={customActions}
            onActionPerformed={() => {}}
          />
        </div>
      ),
    }),
    [customActions],
  )

  // 5) final columns
  const columns = useMemo(
    () => [...baseCols, ...dynamicExtraColumns, rowActionsColumn],
    [baseCols, dynamicExtraColumns, rowActionsColumn],
  )

  // 6) table instance
  const table = useReactTable({
    data: participants,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    globalFilterFn: (row, _columnId, filterValue) => {
      const s = row.original.student
      const values = [
        `${s.firstName} ${s.lastName}`.toLowerCase(),
        s.email?.toLowerCase(),
        s.universityLogin?.toLowerCase(),
        s.matriculationNumber?.toString(),
      ]
      return values.some((v) => v?.includes(filterValue.toLowerCase()))
    },
  })

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
  }
}
