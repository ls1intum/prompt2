import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table'

import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { ErrorPage } from '@/components/ErrorPage'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { DeveloperWithInfo } from '../../interfaces/DeveloperWithInfo'
import { getAllDeveloperProfiles } from '../../network/queries/getAllDeveloperProfiles'
import { FilterMenu } from './components/FilterMenu'
import { useGetParticipationsWithProfiles } from './hooks/useGetParticipationsWithProfiles'
import { useGetFilteredParticipations } from './hooks/useGetFilteredParticipations'
import { DevProfileFilter } from './interfaces/devProfileFilter'
import { columns } from './columns'

export const ResultsOverviewPage = (): JSX.Element => {
  const [filters, setFilters] = useState<DevProfileFilter>({
    passed: { passed: false, notAssessed: false, failed: false },
    challengePassed: { passed: false, notPassed: false, unknown: false },
  })
  const [sorting, setSorting] = useState<SortingState>([])

  const { phaseId } = useParams<{ phaseId: string }>()
  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })
  const {
    data: developerProfiles,
    isPending: isDeveloperProfilesPending,
    isError: isDeveloperProfileError,
    refetch: refetchDeveloperProfiles,
  } = useQuery<DeveloperWithInfo[]>({
    queryKey: ['developerProfiles', phaseId],
    queryFn: () => getAllDeveloperProfiles(phaseId ?? ''),
  })

  const isError = isParticipationsError || isDeveloperProfileError
  const isPending = isCoursePhaseParticipationsPending || isDeveloperProfilesPending

  const handleRefresh = () => {
    refetchCoursePhaseParticipations()
    refetchDeveloperProfiles()
  }

  const participantsWithProfiles = useGetParticipationsWithProfiles(
    coursePhaseParticipations?.participations || [],
    developerProfiles || [],
  )
  const filteredParticipants = useGetFilteredParticipations(participantsWithProfiles, filters)

  const table = useReactTable({
    data: filteredParticipants,
    columns: columns.map((col) => ({ ...col, enableSorting: true })),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isError) return <ErrorPage onRetry={handleRefresh} />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='space-y-6'>
      <ManagementPageHeader>Developer Profile Management</ManagementPageHeader>
      <div className='flex justify-between items-end'>
        <div className='text-sm text-muted-foreground'>
          Showing {filteredParticipants.length} participants
        </div>
        <FilterMenu filters={filters} setFilters={setFilters} />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className='cursor-pointer'
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className='cursor-pointer hover:bg-muted/50'>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className='font-medium'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
