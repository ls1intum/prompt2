import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, FileDown, CheckCircle, XCircle } from 'lucide-react'
import { ActionDialog } from './GroupActionDialog'

interface GroupActionsMenuProps {
  numberOfRowsSelected: number
  onDelete: () => void
  onExport: () => void
  onSetPassed: () => void
  onSetFailed: () => void
}

export const GroupActionsMenu = ({
  numberOfRowsSelected,
  onDelete,
  onExport,
  onSetPassed,
  onSetFailed,
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
          description={`Are you sure you want to delete ${numberOfRowsSelected} applications? This action cannot be undone.`}
          confirmLabel='Delete'
          confirmVariant='destructive'
          isOpen={dialogState.type === 'delete' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={onDelete}
        />
      )}

      {dialogState.isOpen && dialogState.type === 'setPassed' && (
        <ActionDialog
          title='Confirm Set Passed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} applications as accepted?`}
          confirmLabel='Set Accepted'
          isOpen={dialogState.type === 'setPassed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={onSetPassed}
        />
      )}

      {dialogState.isOpen && dialogState.type === 'setFailed' && (
        <ActionDialog
          title='Confirm Set Failed'
          description={`Are you sure you want to mark ${numberOfRowsSelected} applications as rejected?`}
          confirmLabel='Set Rejected'
          isOpen={dialogState.type === 'setFailed' && dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={onSetFailed}
        />
      )}
    </>
  )
}
