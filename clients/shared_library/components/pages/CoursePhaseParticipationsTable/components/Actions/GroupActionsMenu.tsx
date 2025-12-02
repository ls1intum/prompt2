import { Button } from '@tumaet/prompt-ui-components'
import { MoreHorizontal } from 'lucide-react'
import { ActionsMenu } from './ActionsMenu'
import { ActionOnParticipants } from '../../interfaces/ActionOnParticipants'
import { RowModel } from '@tanstack/react-table'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'

interface GroupActionsMenuProps {
  selectedRows: RowModel<CoursePhaseParticipationWithStudent>
  onClose: () => void
  onExport: () => void
  disabled?: boolean
  customActions?: ActionOnParticipants[]
}

export const GroupActionsMenu = ({
  selectedRows,
  onClose,
  onExport,
  disabled = false,
  customActions = [],
}: GroupActionsMenuProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const rows = selectedRows.rows.map((r) => r.original.courseParticipationID)

  return (
    <ActionsMenu
      phaseId={phaseId ?? ''}
      rows={rows}
      customActions={customActions}
      onExport={onExport}
      onFinish={onClose}
      trigger={
        <Button disabled={disabled}>
          <MoreHorizontal className='h-4 w-4' />
          Actions
        </Button>
      }
    />
  )
}
