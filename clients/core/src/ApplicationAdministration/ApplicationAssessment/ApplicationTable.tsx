import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '../../network/queries/getCoursePhaseParticipations'

import {
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
import { useState } from 'react'
import { FilterBuilder } from './components/FilterBuilder'

export const ApplicationTable = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([])

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
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleApplyFilters = (filters: { column: string; condition: string; value: string }[]) => {
    console.log('applying filters:', filters)
    const newColumnFilters = filters.map((filter) => ({
      id: filter.column,
      value: { condition: filter.condition, value: filter.value },
    }))
    setColumnFilters(newColumnFilters)
  }

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
      <FilterBuilder
        columns={columns.map((col) => ({
          accessorKey: col.id as string,
          header: col.header as string,
        }))}
        onApplyFilters={handleApplyFilters}
      />
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
