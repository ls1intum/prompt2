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
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { columns } from './components/columns'
import { Input } from '@/components/ui/input'
import { FilterMenu } from './components/FilterMenu'
import { GroupActionsMenu } from './components/GroupActionsMenu'
import { downloadParticipations } from './utils/downloadParticipations'

interface CoursePhaseParticipationsTablePageProps {
  participants: CoursePhaseParticipationWithStudent[]
  prevMetaDataKeys: string[] // specify which prev meta data names to display
  metaDataKeys: string[] // specify which meta data names to display
}

export const CoursePhaseParticipationsTablePage = ({
  participants,
  prevMetaDataKeys,
  metaDataKeys,
}: CoursePhaseParticipationsTablePageProps): JSX.Element => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const tableColumns = columns({ prevMetaDataKeys, metaDataKeys })

  const table = useReactTable({
    data: participants ?? [],
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
      <div className='space-y-4'>
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
                    prevMetaDataKeys,
                    metaDataKeys,
                  )
                  table.resetRowSelection()
                }}
              />
            )}
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {/* <FilterBadges filters={columnFilters} onRemoveFilter={setColumnFilters} /> */}
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
