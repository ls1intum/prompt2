import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { ActionsDropdownMenuItems } from './ActionsDropdownMenuItems'

import { useState } from 'react'
import { useDefaultParticipantActions } from './hooks/useDefaultParticipantActions'
import { ActionOnParticipants } from '../../interfaces/ActionOnParticipants'
import { FileDown } from 'lucide-react'

interface ActionsMenuProps {
  phaseId: string
  rows: string[]
  trigger: React.ReactNode
  customActions?: ActionOnParticipants[]
  onExport?: () => void
  onFinish: () => void
}

export const ActionsMenu = ({
  phaseId,
  rows,
  trigger,
  customActions,
  onExport,
  onFinish,
}: ActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const defaultActions = useDefaultParticipantActions(phaseId)

  const finish = () => {
    setIsOpen(false)
    onFinish()
  }

  const standardActions: ActionOnParticipants[] = onExport
    ? [
        ...defaultActions,
        {
          label: 'Export',
          icon: <FileDown className='mr-2 h-4 w-4' />,
          onAction: () => onExport(),
        } satisfies ActionOnParticipants,
      ]
    : defaultActions

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <ActionsDropdownMenuItems actions={standardActions} rows={rows} onFinish={finish} />

        {customActions && (
          <>
            <DropdownMenuSeparator />
            <ActionsDropdownMenuItems actions={customActions} rows={rows} onFinish={finish} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
