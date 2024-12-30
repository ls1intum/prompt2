import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '../../network/queries/getCoursePhaseParticipations'

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './components/columns'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { FilterMenu } from './components/FilterMenu'

export const ApplicationsOverview = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    error: participantsError,
    isError: isParticipantsError,
  } = useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['course_phase_participations', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  const table = useReactTable({
    data: fetchedParticipations ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, filterValue) => {
      const { student } = row.original
      const searchableValues = [
        `${student.first_name} ${student.last_name}`.toLowerCase(),
        student.email?.toLowerCase(),
        student.matriculation_number?.toString(),
        student.university_login?.toLowerCase(),
      ]
      return searchableValues.some((value) => value?.includes(filterValue.toLowerCase()))
    },
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
  })

  useEffect(() => {
    console.log('filters', columnFilters)
  }, [columnFilters])

  if (isParticipationsPending) {
    // TODO make this nicer
    return <div>Loading...</div>
  }

  if (isParticipantsError) {
    // TODO make this nicer
    return <div>An error occurred: {participantsError.message}</div>
  }

  return (
    <div>
      <h1>Application Table</h1>
      <div className='flex items-center py-4'>
        <div className='grid w-full max-w-sm items-center gap-1.5'>
          <div className='relative'>
            <Input
              placeholder='Search applications...'
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className='pl-10'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>
        </div>
        <FilterMenu columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
