import { PassStatus } from '@/interfaces/course_phase_participation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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
import { Input } from '@/components/ui/input'
import { Loader2, SearchIcon } from 'lucide-react'
import { FilterMenu } from './components/FilterMenu'
import { VisibilityMenu } from './components/VisibilityMenu'
import { ErrorPage } from '@/components/ErrorPage'
import { FilterBadges } from './components/FilterBadges'
import { ApplicationDetailsView } from './ApplicationDetailsView'
import { ApplicationParticipation } from '@/interfaces/application_participations'
import { getApplicationParticipations } from '../../network/queries/applicationParticipations'

export const ApplicationsOverview = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ gender: false })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApplicationID, setSelectedApplicationID] = useState<string | null>(null)

  const viewApplication = (id: string) => {
    setSelectedApplicationID(id)
    setDialogOpen(true)
  }

  const deleteApplication = (coursePhaseParticipationID: string) => {
    console.log('delete', coursePhaseParticipationID)
  }

  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    isError: isParticipantsError,
    refetch,
  } = useQuery<ApplicationParticipation[]>({
    queryKey: ['application_participations', 'students', phaseId],
    queryFn: () => getApplicationParticipations(phaseId ?? ''),
  })

  const selectedApplication = fetchedParticipations?.find(
    (participation) => participation.id === selectedApplicationID,
  )

  const table = useReactTable({
    data: fetchedParticipations ?? [],
    columns: columns(viewApplication, deleteApplication),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
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
      columnVisibility,
    },
  })

  if (isParticipantsError) {
    return <ErrorPage onRetry={refetch} />
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <h1 className='text-4xl font-bold text-center mb-8'>Applications Overview</h1>
      <div className='space-y-4 mb-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
          <div className='relative flex-grow max-w-md w-full'>
            <Input
              placeholder='Search applications...'
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className='pl-10 w-full'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400' />
          </div>
          <div className='flex space-x-2 w-full sm:w-auto'>
            <FilterMenu columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
            <VisibilityMenu columns={table.getAllColumns()} />
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <FilterBadges filters={columnFilters} onRemoveFilter={setColumnFilters} />
        </div>
      </div>
      {isParticipationsPending ? (
        <div className='flex justify-center items-center flex-grow'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-muted/100'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                      <TableCell
                        key={cell.id}
                        onClick={() => viewApplication(cell.row.original.id)}
                        className='cursor-pointer'
                      >
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
      )}

      {dialogOpen && (
        <ApplicationDetailsView
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          coursePhaseParticipationID={selectedApplicationID ?? ''}
          status={selectedApplication?.pass_status ?? PassStatus.NOT_ASSESSED}
          score={selectedApplication?.score ?? null}
          metaData={selectedApplication?.meta_data ?? {}}
        />
      )}
    </div>
  )
}
