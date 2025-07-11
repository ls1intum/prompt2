import { useState } from 'react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { MoreHorizontal, FileDown, CheckCircle, XCircle } from 'lucide-react'
import { ActionDialog } from '@/components/table/GroupActionDialog'
import { GroupAction } from '../interfaces/GroupAction'
import { RowModel } from '@tanstack/react-table'
import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipationBatch } from '@/hooks/useUpdateCoursePhaseParticipationBatch'
import { UpdateCoursePhaseParticipation } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'

interface GroupActionsMenuProps {
  selectedRows: RowModel<CoursePhaseParticipationWithStudent>
  onClose: () => void
  onExport: () => void
  disabled?: boolean
  customActions?: GroupAction[]
}

export const GroupActionsMenu = ({
  selectedRows,
  onClose,
  onExport,
  disabled = false,
  customActions = [],
}: GroupActionsMenuProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const [isOpen, setIsOpen] = useState(false)

  const [dialogState, setDialogState] = useState<{
    type: 'setPassed' | 'setFailed' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })

  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean
    action: GroupAction | null
    ids: string[]
  }>({ isOpen: false, action: null, ids: [] })

  const openDialog = (type: 'setPassed' | 'setFailed') => {
    setIsOpen(false)
    setDialogState({ type, isOpen: true })
  }

  const closeDialog = () => setDialogState({ type: null, isOpen: false })

  // modifiers
  const { mutate: mutateUpdateCoursePhaseParticipations } = useUpdateCoursePhaseParticipationBatch()
  const numberOfRowsSelected = selectedRows.rows.length

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button disabled={disabled}>
            <MoreHorizontal className='h-4 w-4' />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Default actions */}
          <DropdownMenuItem onClick={() => openDialog('setPassed')}>
            <CheckCircle className='mr-2 h-4 w-4' />
            Set Passed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('setFailed')}>
            <XCircle className='mr-2 h-4 w-4' />
            Set Failed
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Custom actions */}
          {customActions?.map((action, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => {
                const ids = selectedRows.rows.map((r) => r.original.courseParticipationID)
                if (action.confirm) {
                  setCustomDialog({ isOpen: true, action, ids })
                } else {
                  action.onAction(ids)
                  onClose()
                }
              }}
            >
              {action.icon && <span className='mr-2'>{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExport}>
            <FileDown className='mr-2 h-4 w-4' />
            Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogState.isOpen && dialogState.type === 'setPassed' && (
        <ActionDialog
          title='Confirm Set Passed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} participants as passed?`}
          confirmLabel='Set Passed'
          isOpen={dialogState.type === 'setPassed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={() => {
            const mutations = selectedRows.rows.map((row) => {
              const update: UpdateCoursePhaseParticipation = {
                coursePhaseID: phaseId ?? '',
                courseParticipationID: row.original.courseParticipationID,
                passStatus: PassStatus.PASSED,
                restrictedData: {},
                studentReadableData: {},
              }
              return update
            })
            mutateUpdateCoursePhaseParticipations(mutations)
            onClose()
          }}
        />
      )}

      {dialogState.isOpen && dialogState.type === 'setFailed' && (
        <ActionDialog
          title='Confirm Set Failed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} participants as failed?`}
          confirmLabel='Set Failed'
          isOpen={dialogState.type === 'setFailed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={() => {
            const mutations = selectedRows.rows.map((row) => {
              const update: UpdateCoursePhaseParticipation = {
                coursePhaseID: phaseId ?? '',
                courseParticipationID: row.original.courseParticipationID,
                passStatus: PassStatus.FAILED,
                restrictedData: {},
                studentReadableData: {},
              }
              return update
            })
            mutateUpdateCoursePhaseParticipations(mutations)
            onClose()
          }}
        />
      )}

      {customDialog.isOpen && customDialog.action && (
        <ActionDialog
          isOpen={customDialog.isOpen}
          onClose={() => setCustomDialog({ isOpen: false, action: null, ids: [] })}
          onConfirm={() => {
            customDialog.action?.onAction(customDialog.ids)
            setCustomDialog({ isOpen: false, action: null, ids: [] })
            onClose()
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
