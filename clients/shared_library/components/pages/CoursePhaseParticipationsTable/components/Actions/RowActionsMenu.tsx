import { MoreHorizontal } from 'lucide-react'
import { ActionsMenu } from './ActionsMenu'
import { ActionOnParticipants } from '../../interfaces/ActionOnParticipants'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'

interface RowActionsMenuProps {
  row: CoursePhaseParticipationWithStudent
  customActions?: ActionOnParticipants[]
  onActionPerformed: () => void
  onExport?: () => void
}

export const RowActionsMenu = ({
  row,
  customActions = [],
  onActionPerformed,
  onExport,
}: RowActionsMenuProps) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  // This row contains a single participation ID
  const rows = [row.courseParticipationID]

  return (
    <ActionsMenu
      phaseId={phaseId ?? ''}
      rows={rows}
      customActions={customActions}
      trigger={
        <div
          className='h-4 w-4 transform scale-150 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center'
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className='h-3 w-3' />
        </div>
      }
      onFinish={onActionPerformed}
      onExport={onExport}
    />
  )
}
