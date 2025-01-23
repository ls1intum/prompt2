import { PassStatus } from '@/interfaces/course_phase_participation'

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
import { columns } from './components/table/columns'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { FilterMenu } from './components/table/filtering/FilterMenu'
import { VisibilityMenu } from './components/table/menus/VisibilityMenu'
import { FilterBadges } from './components/table/filtering/FilterBadges'
import { ApplicationDetailsDialog } from './components/ApplicationDetailsDialog/ApplicationDetailsDialog'
import { GroupActionsMenu } from './components/table/menus/GroupActionsMenu'
import { downloadApplications } from './utils/downloadApplications'
import AssessmentScoreUpload from './components/ScoreUpload/ScoreUpload'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useCustomElementWidth } from '../../../hooks/useCustomElementWidth'
import { ApplicationManualAddingDialog } from './components/ApplicationManualAddingDialog/ApplicationManualAddingDialog'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import { useDeleteApplications } from './hooks/useDeleteApplications'

export const ApplicationsAssessment = (): JSX.Element => {
  const { additionalScores, participations } = useApplicationStore()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'last_name', desc: false }])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ gender: false })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedApplicationID, setSelectedApplicationID] = useState<string | null>(null)
  const tableWidth = useCustomElementWidth('table-view')

  const { mutate: mutateDeleteApplications } = useDeleteApplications()

  const viewApplication = (id: string) => {
    setSelectedApplicationID(id)
    setDialogOpen(true)
  }

  const deleteApplication = (coursePhaseParticipationID: string) => {
    mutateDeleteApplications([coursePhaseParticipationID])
  }

  const selectedApplication = participations?.find(
    (participation) => participation.id === selectedApplicationID,
  )

  const table = useReactTable({
    data: participations ?? [],
    columns: columns(viewApplication, deleteApplication, additionalScores ?? []),
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

  return (
    <div id='table-view' className='relative flex flex-col space-y-6'>
      <ManagementPageHeader>Applications Overview</ManagementPageHeader>
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
            {participations && <AssessmentScoreUpload applications={participations} />}
            <ApplicationManualAddingDialog existingApplications={participations ?? []} />
            {table.getSelectedRowModel().rows.length > 0 && (
              <GroupActionsMenu
                selectedRows={table.getSelectedRowModel()}
                onClose={() => table.resetRowSelection()}
                onExport={() => {
                  downloadApplications(
                    table.getSelectedRowModel().rows.map((row) => row.original),
                    additionalScores ?? [],
                  )
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

      {dialogOpen && (
        <ApplicationDetailsDialog
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
