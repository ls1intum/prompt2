import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ScrollBar,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tumaet/prompt-ui-components'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import {
  SearchIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { columns as baseColumns } from './components/columns'
import { FilterMenu } from './components/FilterMenu'
import { GroupActionsMenu } from './components/GroupActionsMenu'
import { downloadParticipations } from './utils/downloadParticipations'

import type { ExtraParticipationTableColumn } from './interfaces/ExtraParticipationTableColumn'

interface CoursePhaseParticipationsTablePageProps {
  participants: CoursePhaseParticipationWithStudent[]
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]
  extraColumns?: ExtraParticipationTableColumn[]
  onClickRowAction: (student: CoursePhaseParticipationWithStudent) => void
}

export const CoursePhaseParticipationsTablePage = ({
  participants = [],
  prevDataKeys = [],
  restrictedDataKeys = [],
  studentReadableDataKeys = [],
  extraColumns,
  onClickRowAction,
}: Partial<CoursePhaseParticipationsTablePageProps>): JSX.Element => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

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

    const extraDefs: ColumnDef<CoursePhaseParticipationWithStudent>[] = extraColumns.map((col) => ({
      id: col.id,
      header: col.header,
      accessorFn: (row) => {
        const id = (row as unknown as { courseParticipationID: string }).courseParticipationID
        return extraDataMaps[col.id]?.get(id) ?? ''
      },
      enableSorting: col.enableSorting ?? false,
      enableColumnFilter: col.enableColumnFilter ?? false,
      sortingFn: col.sortingFn,
      filterFn: col.filterFn,
      cell: (info) => info.getValue(),
    }))

    return [...baseCols, ...extraDefs]
  }, [baseCols, extraColumns, extraDataMaps])

  const table = useReactTable({
    data: participants,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
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
      pagination,
    },
  })

  const pageSizeOptions = [10, 25, 50, 100, 200]

  return (
    <div>
      <div className='space-y-4 mb-2 w-full'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full'>
          <div className='relative flex-grow w-full'>
            <Input
              placeholder='Search participants...'
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className='pl-10 w-full'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>
          <div className='flex space-x-2 w-full sm:w-auto'>
            <FilterMenu
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              extraFilters={extraColumns?.map((col) => ({
                id: col.id,
                label: col.header,
                options: Array.from(
                  new Set(col.extraData.map((d) => String(d.value ?? ''))),
                ).filter((v) => v !== ''),
                getDisplay: (v) => v,
              }))}
            />
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
                )
                table.resetRowSelection()
              }}
            />
          </div>
        </div>
      </div>

      <div className='rounded-md border'>
        <ScrollArea className='h-[calc(100vh-280px)] overflow-x-scroll'>
          <Table className='table-auto min-w-full w-full relative'>
            <TableHeader className='bg-muted/100 sticky top-0 z-10'>
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

      <div className='pt-4 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center justify-center gap-6 sm:gap-10'>
          <p className='text-sm font-medium'>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to first page</span>
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to last page</span>
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
