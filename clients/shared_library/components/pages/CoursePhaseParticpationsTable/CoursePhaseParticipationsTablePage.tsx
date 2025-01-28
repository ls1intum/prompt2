import { ManagementPageHeader } from '@/components/ManagementPageHeader'
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
import { Loader2, SearchIcon } from 'lucide-react'

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
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ErrorPage } from '@/components/ErrorPage'
import { columns } from './components/columns'
import { Input } from '@/components/ui/input'
import { FilterMenu } from './components/FilterMenu'
import { GroupActionsMenu } from './components/GroupActionsMenu'

export const CoursePhaseParticipationsTablePage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lastName', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  const table = useReactTable({
    data: coursePhaseParticipations ?? [],
    columns: columns(),
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
      <ManagementPageHeader>Course Phase Participants</ManagementPageHeader>
      {isParticipationsError ? (
        <ErrorPage onRetry={refetchCoursePhaseParticipations} />
      ) : isCoursePhaseParticipationsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
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
                      // downloadApplications(
                      //   table.getSelectedRowModel().rows.map((row) => row.original),
                      //   additionalScores ?? [],
                      // )
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
                      <TableCell colSpan={columns().length} className='h-24 text-center'>
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
      )}
    </div>
  )
}
