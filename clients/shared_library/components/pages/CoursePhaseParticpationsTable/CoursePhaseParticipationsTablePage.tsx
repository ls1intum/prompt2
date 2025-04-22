import { ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { SearchIcon } from 'lucide-react'

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { columns as baseColumns } from './components/columns'
import { Input } from '@/components/ui/input'
import { FilterMenu } from './components/FilterMenu'
import { GroupActionsMenu } from './components/GroupActionsMenu'
import { downloadParticipations } from './utils/downloadParticipations'

export interface ExtraParticipationData {
  courseParticipationID: string
  value: React.ReactNode
}

interface CoursePhaseParticipationsTablePageProps {
  participants: CoursePhaseParticipationWithStudent[]
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
  extraData?: ExtraParticipationData[]
  extraColumnHeader?: string
  onClickRowAction: (student: CoursePhaseParticipationWithStudent) => void
}

export const CoursePhaseParticipationsTablePage = ({
  participants = [],
  prevDataKeys = [],
  restrictedDataKeys = [],
  studentReadableDataKeys = [],
  extraData,
  extraColumnHeader = 'Additional',
  onClickRowAction,
}: Partial<CoursePhaseParticipationsTablePageProps>): JSX.Element => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const extraDataMap = useMemo(() => {
    if (!extraData) return new Map<string, React.ReactNode>()
    return new Map(extraData.map((d) => [d.courseParticipationID, d.value]))
  }, [extraData])

  const baseCols = useMemo(
    () => baseColumns({ prevDataKeys, restrictedDataKeys, studentReadableDataKeys }),
    [prevDataKeys, restrictedDataKeys, studentReadableDataKeys],
  )

  const tableColumns = useMemo((): ColumnDef<CoursePhaseParticipationWithStudent, unknown>[] => {
    if (!extraData) return baseCols

    const extraColumn: ColumnDef<CoursePhaseParticipationWithStudent, unknown> = {
      id: 'extraColumn',
      header: extraColumnHeader,
      accessorFn: (row) =>
        extraDataMap.get(
          (row as unknown as { courseParticipationID: string }).courseParticipationID,
        ) ?? '',
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        // hide completely when every cell would be empty
        isEmpty: extraData.length === 0,
      },
      cell: (info) => info.getValue(),
    }

    return [...baseCols, extraColumn]
  }, [baseCols, extraData, extraColumnHeader, extraDataMap])

  const table = useReactTable({
    data: participants,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
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
    },
  })

  return (
    <div>
      <div className='space-y-4 mb-2'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
          <div className='relative flex-grow max-w-md w-full'>
            <Input
              placeholder='Search participants...'
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className='pl-10 w-full'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>
          <div className='flex space-x-2 w-full sm:w-auto'>
            <FilterMenu columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
            {table.getSelectedRowModel().rows.length > 0 && (
              <GroupActionsMenu
                selectedRows={table.getSelectedRowModel()}
                onClose={() => table.resetRowSelection()}
                onExport={() => {
                  downloadParticipations(
                    table.getSelectedRowModel().rows.map((row) => row.original),
                    prevDataKeys,
                    restrictedDataKeys,
                    studentReadableDataKeys,
                  )
                  table.resetRowSelection()
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div className='rounded-md border'>
        <ScrollArea className='h-[calc(100vh-200px)] overflow-x-scroll'>
          <Table className='table-auto min-w-full w-full relative'>
            <TableHeader className='bg-muted/100 sticky top-0 z-10'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                      <TableCell key={cell.id}>
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
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>
    </div>
  )
}
