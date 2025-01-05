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
import { GroupActionsMenu } from './components/GroupActionsMenu'
import { downloadApplications } from './utils/downloadApplications'
import AssessmentScoreUpload from './ScoreUpload/ScoreUpload'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { getAdditionalScoreNames } from '../../network/queries/additionalScoreNames'
import { useApplicationStatusUpdate } from './handlers/useApplicationStatusUpdate'
import { useCustomElementWidth } from '../../handlers/useCustomElementWidth'

export const ApplicationsOverview = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'last_name', desc: false }])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ gender: false })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApplicationID, setSelectedApplicationID] = useState<string | null>(null)
  const tableWidth = useCustomElementWidth('table-view')

  const viewApplication = (id: string) => {
    setSelectedApplicationID(id)
    setDialogOpen(true)
  }

  const deleteApplication = (coursePhaseParticipationID: string) => {
    console.log('delete', coursePhaseParticipationID)
  }

  const {
    data: fetchedAdditionalScores,
    isPending: isAdditionalScoresPending,
    isError: isAdditionalScoresError,
    refetch: refetchScores,
  } = useQuery<string[]>({
    queryKey: ['application_participations', phaseId],
    queryFn: () => getAdditionalScoreNames(phaseId ?? ''),
  })

  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    isError: isParticipantsError,
    refetch: refetchParticipations,
  } = useQuery<ApplicationParticipation[]>({
    queryKey: ['application_participations', 'students', phaseId],
    queryFn: () => getApplicationParticipations(phaseId ?? ''),
  })

  const isError = isParticipantsError || isAdditionalScoresError
  const isPending = isParticipationsPending || isAdditionalScoresPending
  const refetch = () => {
    refetchParticipations()
    refetchScores()
  }

  const selectedApplication = fetchedParticipations?.find(
    (participation) => participation.id === selectedApplicationID,
  )

  const { mutate: mutateUpdateApplicationStatus } = useApplicationStatusUpdate()

  const table = useReactTable({
    data: fetchedParticipations ?? [],
    columns: columns(viewApplication, deleteApplication, fetchedAdditionalScores ?? []),
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

  if (isError) {
    return <ErrorPage onRetry={refetch} />
  }

  return (
    <div id='table-view' className='relative flex flex-col space-y-6 p-4'>
      <h1 className='text-3xl md:text-4xl font-bold text-center'>Applications Overview</h1>
      <div className='space-y-4'>
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
            {fetchedParticipations && (
              <AssessmentScoreUpload applications={fetchedParticipations} />
            )}
            {table.getSelectedRowModel().rows.length > 0 && (
              <GroupActionsMenu
                numberOfRowsSelected={table.getSelectedRowModel().rows.length}
                onDelete={() => {
                  console.log('delete')
                  table.resetRowSelection()
                }}
                onExport={() => {
                  downloadApplications(
                    table.getSelectedRowModel().rows.map((row) => row.original),
                    fetchedAdditionalScores ?? [],
                  )
                  table.resetRowSelection()
                }}
                onSetFailed={() => {
                  mutateUpdateApplicationStatus({
                    pass_status: PassStatus.FAILED,
                    course_phase_participation_ids: table
                      .getSelectedRowModel()
                      .rows.map((row) => row.original.id),
                  })
                  table.resetRowSelection()
                }}
                onSetPassed={() => {
                  mutateUpdateApplicationStatus({
                    pass_status: PassStatus.PASSED,
                    course_phase_participation_ids: table
                      .getSelectedRowModel()
                      .rows.map((row) => row.original.id),
                  })
                  table.resetRowSelection()
                }}
              />
            )}
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <FilterBadges filters={columnFilters} onRemoveFilter={setColumnFilters} />
        </div>
      </div>
      {isPending ? (
        <div className='flex justify-center items-center flex-grow'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <div className='rounded-md border' style={{ width: `${tableWidth + 50}px` }}>
          <ScrollArea className='h-[calc(100vh-300px)] overflow-x-scroll'>
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
                        <TableCell
                          key={cell.id}
                          onClick={() => viewApplication(cell.row.original.id)}
                          className='cursor-pointer whitespace-nowrap'
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
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
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
