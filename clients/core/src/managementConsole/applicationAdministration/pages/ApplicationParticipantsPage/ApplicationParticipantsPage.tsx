import { useEffect, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { PassStatus } from '@tumaet/prompt-shared-state'

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
  Input,
  ScrollArea,
  ScrollBar,
  ManagementPageHeader,
  useCustomElementWidth,
} from '@tumaet/prompt-ui-components'

import { columns } from './components/table/columns'
import { FilterMenu } from './components/table/filtering/FilterMenu'
import { VisibilityMenu } from './components/table/menus/VisibilityMenu'
import { FilterBadges } from './components/table/filtering/FilterBadges'
import { ApplicationDetailsDialog } from './components/ApplicationDetailsDialog/ApplicationDetailsDialog'
import { GroupActionsMenu } from './components/table/menus/GroupActionsMenu'
import AssessmentScoreUpload from './components/ScoreUpload/ScoreUpload'
import { downloadApplications } from './utils/downloadApplications'
import { ApplicationManualAddingDialog } from './components/ApplicationManualAddingDialog/ApplicationManualAddingDialog'
import { useApplicationStore } from '../../zustand/useApplicationStore'
import { useDeleteApplications } from './hooks/useDeleteApplications'

export const ApplicationParticipantsPage = (): JSX.Element => {
  const { additionalScores, participations } = useApplicationStore()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'passStatus', desc: false },
    { id: 'lastName', desc: false },
  ])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ gender: false })
  const [rowSelection, setRowSelection] = useState({})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCourseParticipationID, setSelectedCourseParticipationID] = useState<
    string | undefined
  >(undefined)
  const tableWidth = useCustomElementWidth('table-view')

  const { mutate: mutateDeleteApplications } = useDeleteApplications()

  const viewApplication = (courseParticipationID: string) => {
    setSelectedCourseParticipationID(courseParticipationID)
    setDialogOpen(true)
  }

  const deleteApplication = (courseParticipationID: string) => {
    mutateDeleteApplications([courseParticipationID])
  }

  const selectedApplication = participations?.find(
    (participation) => participation.courseParticipationID === selectedCourseParticipationID,
  )

  const tableColumns = columns(viewApplication, deleteApplication, additionalScores ?? [])

  const table = useReactTable({
    data: participations ?? [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
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
      columnVisibility,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  })

  // When the filters change, update the row selection so that only visible rows remain selected
  useEffect(() => {
    // Get the ids of rows that are visible after filtering
    const visibleRowIDs = new Set(table.getFilteredRowModel().rows.map((row) => row.id))
    // Update rowSelection to only keep selections for visible rows
    setRowSelection((prevSelection) => {
      const newSelection = { ...prevSelection }
      Object.keys(newSelection).forEach((id) => {
        if (!visibleRowIDs.has(id)) {
          delete newSelection[id]
        }
      })
      return newSelection
    })
  }, [columnFilters, globalFilter, table])

  // when sorting for status, this adds sorting by last name
  useEffect(() => {
    if (
      sorting.find((sort) => sort.id === 'passStatus') &&
      !sorting.find((sort) => sort.id === 'lastName')
    ) {
      setSorting((prev) => {
        return [...prev, { id: 'lastName', desc: false }]
      })
    }
  }, [sorting])
  const filteredRowsCount = table.getFilteredRowModel().rows.length
  const totalRowsCount = participations?.length ?? 0

  return (
    <div id='table-view' className='relative flex flex-col'>
      <ManagementPageHeader>Application Participants</ManagementPageHeader>
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

      <div className='text-sm text-muted-foreground mb-2 mt-4'>
        Showing {filteredRowsCount} of {totalRowsCount} applications
      </div>

      <div className='rounded-md border' style={{ width: `${tableWidth}px` }}>
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
                        onClick={() => viewApplication(cell.row.original.courseParticipationID)}
                        className='cursor-pointer whitespace-nowrap'
                      >
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

      {dialogOpen && (
        <ApplicationDetailsDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          courseParticipationID={selectedCourseParticipationID ?? ''}
          status={selectedApplication?.passStatus ?? PassStatus.NOT_ASSESSED}
          score={selectedApplication?.score ?? null}
          restrictedData={selectedApplication?.restrictedData ?? {}}
        />
      )}
    </div>
  )
}
