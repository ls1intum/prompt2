import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from '@tumaet/prompt-ui-components'
import { SearchIcon, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { columns as baseColumns } from './components/columns'
import { FilterMenu } from './components/FilterMenu'
import { GroupActionsMenu } from './components/GroupActionsMenu'
import { VisibilityMenu } from './components/VisibilityMenu'
import { downloadParticipations } from './utils/downloadParticipations'
import { ExtraParticipationTableColumn } from './interfaces/ExtraParticipationTableColumn'
import { GroupAction } from './interfaces/GroupAction'

interface CoursePhaseParticipationsTablePageProps {
  participants: CoursePhaseParticipationWithStudent[]
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
  hideActions?: boolean
  extraColumns?: ExtraParticipationTableColumn[]
  tableWidth?: number
  onClickRowAction?: (student: CoursePhaseParticipationWithStudent) => void
  customActions?: GroupAction[]
  toolbarActions?: React.ReactNode
}

export const CoursePhaseParticipationsTablePage = ({
  participants = [],
  prevDataKeys = [],
  restrictedDataKeys = [],
  studentReadableDataKeys = [],
  hideActions = false,
  extraColumns,
  tableWidth,
  onClickRowAction,
  customActions = [],
  toolbarActions,
}: CoursePhaseParticipationsTablePageProps): JSX.Element => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const baseCols = useMemo(
    () => baseColumns({ prevDataKeys, restrictedDataKeys, studentReadableDataKeys }),
    [prevDataKeys, restrictedDataKeys, studentReadableDataKeys],
  )

  const extraDataMaps = useMemo(() => {
    const map: Record<string, Map<string, React.ReactNode>> = {}
    extraColumns?.forEach((col) => {
      map[col.id] = new Map(col.extraData.map((d) => [d.courseParticipationID, d.value]))
    })
    return map
  }, [extraColumns])

  const tableColumns = useMemo((): ColumnDef<CoursePhaseParticipationWithStudent, unknown>[] => {
    if (!extraColumns || extraColumns.length === 0) return baseCols

    const extraDefs: ColumnDef<CoursePhaseParticipationWithStudent>[] = extraColumns.map((col) => {
      const columnDef: ColumnDef<CoursePhaseParticipationWithStudent> = {
        id: col.id,
        header: col.header,
        accessorFn: (row) => {
          const id = (row as unknown as { courseParticipationID: string }).courseParticipationID
          return extraDataMaps[col.id]?.get(id) ?? ''
        },
        enableSorting: col.enableSorting ?? false,
        enableColumnFilter: col.enableColumnFilter ?? false,
        cell: (info) => info.getValue(),
      }

      if (col.sortingFn) {
        columnDef.sortingFn = col.sortingFn
      }
      if (col.filterFn) {
        columnDef.filterFn = col.filterFn
      }

      return columnDef
    })

    return [...baseCols, ...extraDefs]
  }, [baseCols, extraColumns, extraDataMaps])

  const table = useReactTable({
    data: participants,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, columnId, filterValue) => {
      const { student } = row.original
      const searchableValues = [
        `${student.firstName} ${student.lastName}`.toLowerCase(),
        student.email?.toLowerCase(),
        student.matriculationNumber?.toString(),
        student.universityLogin?.toLowerCase(),
      ]
      return searchableValues.some((value) => value?.includes(filterValue.toLowerCase()))
    },
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
  })

  const filteredRowsCount = table.getFilteredRowModel().rows.length
  const totalRowsCount = participants.length

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between w-full gap-3'>
          <div className='relative flex-1 min-w-0 overflow-hidden'>
            <Input
              placeholder='Search participants...'
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className='pl-10 w-full min-w-0'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>

          <div className='flex items-center gap-2 flex-none'>
            <FilterMenu
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              extraFilters={extraColumns
                ?.filter((col) => col.filterFn)
                .map((col) => ({
                  id: col.id,
                  label: col.header,
                  options: Array.from(
                    new Set(col.extraData.map((d) => String(d.stringValue ?? d.value ?? ''))),
                  )
                    .filter((v) => v !== '')
                    .sort((a, b) => a.localeCompare(b)),
                  getDisplay: (v) => v,
                }))}
            />

            <VisibilityMenu columns={table.getAllColumns()} />

            {toolbarActions}

            {!hideActions && (
              <GroupActionsMenu
                disabled={table.getSelectedRowModel().rows.length === 0}
                selectedRows={table.getSelectedRowModel()}
                onClose={() => table.resetRowSelection()}
                onExport={() => {
                  downloadParticipations(
                    table.getSelectedRowModel().rows.map((row) => row.original),
                    prevDataKeys,
                    restrictedDataKeys,
                    studentReadableDataKeys,
                    extraColumns,
                  )
                  table.resetRowSelection()
                }}
                customActions={customActions}
              />
            )}
          </div>
        </div>
      </div>

      <div className='text-sm text-muted-foreground mb-2 mt-6'>
        Showing {filteredRowsCount} of {totalRowsCount} participants
      </div>

      <div className='rounded-md border overflow-x-scroll' style={{ width: `${tableWidth}px` }}>
        <Table className='table-auto w-full relative'>
          <TableHeader className='bg-muted/100'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='whitespace-nowrap'>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {typeof header.column.columnDef.header === 'string' &&
                          header.column.getCanSort() && (
                            <span className='ml-2'>
                              {{
                                asc: <ArrowUp className='h-4 w-4' />,
                                desc: <ArrowDown className='h-4 w-4' />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
                              )}
                            </span>
                          )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onClickRowAction && onClickRowAction(row.original)}
                  className={onClickRowAction ? 'cursor-pointer' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`whitespace-nowrap ${onClickRowAction ? 'cursor-pointer' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
