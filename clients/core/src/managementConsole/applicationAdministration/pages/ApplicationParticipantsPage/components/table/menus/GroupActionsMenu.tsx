import { useState } from 'react'
import { MoreHorizontal, Trash2, FileDown, CheckCircle, XCircle } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { RowModel } from '@tanstack/react-table'
import { ApplicationParticipation } from '../../../../../interfaces/applicationParticipation'
import { useApplicationStatusUpdate } from '../../../hooks/useApplicationStatusUpdate'
import { useDeleteApplications } from '../../../hooks/useDeleteApplications'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { ActionDialog } from '@/components/table/GroupActionDialog'

interface GroupActionsMenuProps {
  selectedRows: RowModel<ApplicationParticipation>
  onClose: () => void
  onExport: () => void
}

export const GroupActionsMenu = ({
  selectedRows,
  onClose,
  onExport,
}: GroupActionsMenuProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogState, setDialogState] = useState<{
    type: 'delete' | 'setPassed' | 'setFailed' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })

  const openDialog = (type: 'delete' | 'setPassed' | 'setFailed') => {
    setIsOpen(false)
    setDialogState({ type, isOpen: true })
  }

  const closeDialog = () => setDialogState({ type: null, isOpen: false })

  // modifiers
  const { mutate: mutateUpdateApplicationStatus } = useApplicationStatusUpdate()
  const { mutate: mutateDeleteApplications } = useDeleteApplications()
  const numberOfRowsSelected = selectedRows.rows.length

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button>
            <MoreHorizontal className='h-4 w-4' />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => openDialog('setPassed')}>
            <CheckCircle className='mr-2 h-4 w-4' />
            Set Accepted
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('setFailed')}>
            <XCircle className='mr-2 h-4 w-4' />
            Set Rejected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExport}>
            <FileDown className='mr-2 h-4 w-4' />
            Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('delete')} className='text-destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogState.isOpen && dialogState.type === 'delete' && (
        <ActionDialog
          title='Confirm Deletion'
          description={`Are you sure you want to delete ${numberOfRowsSelected} applications? This action cannot be undone. 
          The course application will be deleted for the selected students.`}
          confirmLabel='Delete'
          confirmVariant='destructive'
          isOpen={dialogState.type === 'delete' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={() => {
            mutateDeleteApplications(
              selectedRows.rows.map((row) => row.original.courseParticipationID),
            )
            onClose()
          }}
        />
      )}

      {dialogState.isOpen && dialogState.type === 'setPassed' && (
        <ActionDialog
          title='Confirm Set Passed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} applications as accepted?`}
          confirmLabel='Set Accepted'
          isOpen={dialogState.type === 'setPassed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={() => {
            mutateUpdateApplicationStatus({
              passStatus: PassStatus.PASSED,
              courseParticipationIDs: selectedRows.rows.map(
                (row) => row.original.courseParticipationID,
              ),
            })
            onClose()
          }}
        />
      )}

      {dialogState.isOpen && dialogState.type === 'setFailed' && (
        <ActionDialog
          title='Confirm Set Failed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} applications as rejected?`}
          confirmLabel='Set Rejected'
          isOpen={dialogState.type === 'setFailed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={() => {
            mutateUpdateApplicationStatus({
              passStatus: PassStatus.FAILED,
              courseParticipationIDs: selectedRows.rows.map(
                (row) => row.original.courseParticipationID,
              ),
            })
            onClose()
          }}
        />
      )}
    </>
  )
}
