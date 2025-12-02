import { ActionOnParticipants } from '../../interfaces/ActionOnParticipants'
import { DropdownMenuItemForActionOnParticipants } from './DropdownMenuItemForActionOnParticipants'

interface ActionsDropdownMenuItemsProps {
  actions: ActionOnParticipants[]
  rows: string[]
  onFinish: () => void
}

export const ActionsDropdownMenuItems = ({
  actions,
  rows,
  onFinish,
}: ActionsDropdownMenuItemsProps) => {
  return (
    <>
      {actions.map((action) => (
        <DropdownMenuItemForActionOnParticipants
          action={action}
          rows={rows}
          key={action.label}
          onEnd={onFinish}
        />
      ))}
    </>
  )
}
