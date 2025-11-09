import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { MoreHorizontal } from 'lucide-react'
import { ActionDialog } from '@/components/table/GroupActionDialog'
import { GroupAction } from '../interfaces/GroupAction'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface RowActionsMenuProps {
  row: CoursePhaseParticipationWithStudent
  customActions?: GroupAction[]
  onActionPerformed?: () => void
}

export const RowActionsMenu = ({
  row,
  customActions = [],
  onActionPerformed,
}: RowActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean
    action: GroupAction | null
    id: string | null
  }>({ isOpen: false, action: null, id: null })

  const ids = [row.courseParticipationID]

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className='w-full flex flex-col items-center justify-center'>
            <button
              className='h-4 w-4 transform scale-150 rounded-2xl hover:bg-gray-200 transition-all'
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className='h-3 w-3 mx-auto' />
            </button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {customActions.map((action, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => {
                if (action.confirm) {
                  setCustomDialog({ isOpen: true, action, id: row.courseParticipationID })
                } else {
                  action.onAction(ids)
                  setIsOpen(false)
                  onActionPerformed && onActionPerformed()
                }
              }}
            >
              {action.icon && <span className='mr-2'>{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {customDialog.isOpen && customDialog.action && (
        <ActionDialog
          isOpen={customDialog.isOpen}
          onClose={() => setCustomDialog({ isOpen: false, action: null, id: null })}
          onConfirm={() => {
            customDialog.action?.onAction([customDialog.id ?? ''])
            setCustomDialog({ isOpen: false, action: null, id: null })
            setIsOpen(false)
            onActionPerformed && onActionPerformed()
          }}
          title={customDialog.action.confirm?.title ?? 'Confirm Action'}
          description={
            customDialog.action.confirm?.description ??
            'Are you sure you want to perform this action?'
          }
          confirmLabel={customDialog.action.confirm?.confirmLabel ?? 'Confirm'}
        />
      )}
    </>
  )
}
