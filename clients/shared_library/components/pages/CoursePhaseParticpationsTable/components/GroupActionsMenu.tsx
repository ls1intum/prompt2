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
import { MoreHorizontal, FileDown, CheckCircle, XCircle } from 'lucide-react'
import { ActionDialog } from '@/components/table/GroupActionDialog'
import { RowModel } from '@tanstack/react-table'
import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { useUpdateCoursePhaseParticipationBatch } from '@/hooks/useUpdateCoursePhaseParticipationBatch'
import { UpdateCoursePhaseParticipation } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'

interface GroupActionsMenuProps {
  selectedRows: RowModel<CoursePhaseParticipationWithStudent>
  onClose: () => void
  onExport: () => void
}

export const GroupActionsMenu = ({
  selectedRows,
  onClose,
  onExport,
}: GroupActionsMenuProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [isOpen, setIsOpen] = useState(false)
  const [dialogState, setDialogState] = useState<{
    type: 'setPassed' | 'setFailed' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })

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
            Set Passed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog('setFailed')}>
            <XCircle className='mr-2 h-4 w-4' />
            Set Failed
          </DropdownMenuItem>
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
    </>
  )
}
