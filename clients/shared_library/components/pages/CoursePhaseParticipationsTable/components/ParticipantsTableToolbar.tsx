// components/ParticipantsTableToolbar.tsx
import { Input } from '@tumaet/prompt-ui-components'
import { SearchIcon } from 'lucide-react'
import { FilterMenu } from './FilterMenu'
import { VisibilityMenu } from './VisibilityMenu'
import { GroupActionsMenu } from './Actions/GroupActionsMenu'
import { ActiveFilterBadges } from '../utils/ActiveFilterBadges'

import { ExtraParticipationTableColumn } from '../interfaces/ExtraParticipationTableColumn'
import { ActionOnParticipants } from '../interfaces/ActionOnParticipants'
import { ColumnFiltersState, Table } from '@tanstack/react-table'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface Props {
  table: Table<CoursePhaseParticipationWithStudent>
  globalFilter: string
  setGlobalFilter: (v: string) => void

  columnFilters: ColumnFiltersState
  setColumnFilters: (v: ColumnFiltersState) => void

  hideActions?: boolean
  onExport: () => void
  toolbarActions?: React.ReactNode

  extraColumns?: ExtraParticipationTableColumn[]
  customActions?: ActionOnParticipants[]

  customFilterMenu?: () => React.ReactNode
}

export const ParticipantsTableToolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  hideActions,
  onExport,
  toolbarActions,
  extraColumns = [],
  customActions = [],
  customFilterMenu,
}: Props) => {
  const selectedCount = table.getSelectedRowModel().rows.length

  const extraFilters =
    extraColumns
      ?.filter((col) => col.filterFn)
      .map((col) => ({
        id: col.id,
        label: col.header,
        options: Array.from(
          new Set(col.extraData.map((d) => String(d.stringValue ?? d.value ?? ''))),
        )
          .filter((v) => v !== '')
          .sort((a, b) => a.localeCompare(b)),
      })) ?? []

  const setColumnFiltersF = (updater) => {
    if (typeof updater === 'function') {
      setColumnFilters(updater(columnFilters))
    } else {
      setColumnFilters(updater)
    }
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between w-full gap-3'>
          {/* Search */}
          <div className='relative flex-1 min-w-0 overflow-hidden'>
            <Input
              placeholder='Search participants...'
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className='pl-10 w-full min-w-0'
            />
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500' />
          </div>

          {/* Filters, Visibility, Actions */}
          <div className='flex items-center gap-2 flex-none'>
            {customFilterMenu ? (
              customFilterMenu()
            ) : (
              <FilterMenu
                columnFilters={columnFilters}
                setColumnFilters={setColumnFiltersF}
                extraFilters={extraFilters}
              />
            )}

            <VisibilityMenu columns={table.getAllColumns()} />

            {toolbarActions}

            {!hideActions && (
              <GroupActionsMenu
                disabled={selectedCount === 0}
                selectedRows={table.getSelectedRowModel()}
                onClose={() => table.resetRowSelection()}
                onExport={onExport}
                customActions={customActions}
              />
            )}
          </div>
        </div>

        <ActiveFilterBadges
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnFiltersState={columnFilters}
          setColumnFiltersFn={setColumnFiltersF}
          table={table}
        />
      </div>

      {/* Counts */}
      <div className='mb-2 mt-2 flex gap-2'>
        {selectedCount > 0 && (
          <div className='text-sm text-foreground'>{selectedCount} selected</div>
        )}

        <div className='text-sm text-muted-foreground'>
          Showing {table.getFilteredRowModel().rows.length} of{' '}
          {table.getPrePaginationRowModel().rows.length} participants
        </div>
      </div>
    </>
  )
}
