// CoursePhaseParticipationsTablePage.tsx
import { ParticipantsTable } from './components/ParticipantsTable'
import { ParticipantsTableToolbar } from './components/ParticipantsTableToolbar'
import { useParticipantsTable } from './hooks/useParticipantsTable'
import { downloadParticipations } from './utils/downloadParticipations'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { ExtraParticipationTableColumn } from './interfaces/ExtraParticipationTableColumn'
import { ActionOnParticipants } from './interfaces/ActionOnParticipants'
import { ColumnFiltersState } from '@tanstack/react-table'

interface Props {
  participants: CoursePhaseParticipationWithStudent[]
  prevDataKeys: string[]
  restrictedDataKeys: string[]
  studentReadableDataKeys: string[]

  extraColumns?: ExtraParticipationTableColumn[]
  hideActions?: boolean

  customActions?: ActionOnParticipants[]
  toolbarActions?: React.ReactNode

  // Custom filtering support:
  columnFilters?: ColumnFiltersState
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  customFilterMenu?: () => React.ReactNode

  onClickRowAction?: (student: CoursePhaseParticipationWithStudent) => void
}

export const CoursePhaseParticipationsTablePage = ({
  participants = [],
  prevDataKeys = [],
  restrictedDataKeys = [],
  studentReadableDataKeys = [],
  extraColumns = [],
  hideActions = false,
  customActions = [],
  toolbarActions,
  columnFilters,
  setColumnFilters,
  customFilterMenu,
  onClickRowAction,
}: Props) => {
  const tableStuff = useParticipantsTable({
    participants,
    prevDataKeys,
    restrictedDataKeys,
    studentReadableDataKeys,
    extraColumns,
    customActions,
    columnFilters,
    setColumnFilters,
  })

  const onExport = () =>
    downloadParticipations(
      tableStuff.table.getSelectedRowModel().rows.map((r) => r.original),
      prevDataKeys,
      restrictedDataKeys,
      studentReadableDataKeys,
      extraColumns,
    )

  return (
    <>
      <ParticipantsTableToolbar
        {...tableStuff}
        hideActions={hideActions}
        onExport={onExport}
        toolbarActions={toolbarActions}
        extraColumns={extraColumns}
        customActions={customActions}
        customFilterMenu={customFilterMenu}
      />

      <ParticipantsTable table={tableStuff.table} onClickRowAction={onClickRowAction} />
    </>
  )
}
