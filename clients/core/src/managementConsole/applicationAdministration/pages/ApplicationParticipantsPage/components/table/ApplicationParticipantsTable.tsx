import { useMemo } from 'react'
import { PromptTable, TableFilter } from '@tumaet/prompt-ui-components'

import { useDeleteApplications } from '../../hooks/useDeleteApplications'
import { useApplicationStore } from '@core/managementConsole/applicationAdministration/zustand/useApplicationStore'
import { ApplicationRow, buildApplicationRows } from './applicationRow'
import { getApplicationColumns } from './applicationColumns'
import { getApplicationFilters } from './applicationFilters'
import { getApplicationActions } from './applicationActions'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipationBatch } from '@/hooks/useUpdateCoursePhaseParticipationBatch'
import { ColumnDef } from '@tanstack/react-table'

export const ApplicationParticipantsTable = ({
  phaseId,
  openDialog,
}: {
  phaseId: string
  openDialog: (row: ApplicationRow) => void
}): JSX.Element => {
  const { participations, additionalScores } = useApplicationStore()
  const { mutate: deleteApplications } = useDeleteApplications()

  const data = useMemo(
    () => buildApplicationRows(participations, additionalScores),
    [participations, additionalScores],
  )

  const columns: ColumnDef<ApplicationRow>[] = useMemo(
    () => getApplicationColumns(additionalScores),
    [additionalScores],
  )

  const filters: TableFilter[] = useMemo(
    () => getApplicationFilters(additionalScores),
    [additionalScores],
  )

  const { mutate: updateBatch } = useUpdateCoursePhaseParticipationBatch()

  const actions = useMemo(() => {
    const setStatus = (status: PassStatus, rows: ApplicationRow[]) => {
      updateBatch(
        rows.map((r) => ({
          coursePhaseID: phaseId,
          courseParticipationID: r.courseParticipationID,
          passStatus: status,
          restrictedData: r.restrictedData ?? {},
          studentReadableData: {},
        })),
      )
    }
    return getApplicationActions(deleteApplications, openDialog, {
      setPassed: (r) => setStatus(PassStatus.PASSED, r),
      setFailed: (r) => setStatus(PassStatus.FAILED, r),
    })
  }, [deleteApplications, openDialog, phaseId, updateBatch])

  return (
    <PromptTable<ApplicationRow>
      data={data}
      columns={columns}
      filters={filters}
      actions={actions}
      onRowClick={openDialog}
    />
  )
}
