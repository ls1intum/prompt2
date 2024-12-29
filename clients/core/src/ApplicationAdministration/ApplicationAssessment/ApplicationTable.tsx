import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '../../network/queries/getCoursePhaseParticipations'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './components/columns'

export const ApplicationTable = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
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
  })

  if (isParticipationsPending) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Application Table</h1>
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
