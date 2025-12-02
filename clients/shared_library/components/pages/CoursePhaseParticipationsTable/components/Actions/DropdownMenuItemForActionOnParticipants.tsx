import { useState } from 'react'

import { ActionOnParticipants } from '../../interfaces/ActionOnParticipants'
import { ActionDialog, DropdownMenuItem } from '@tumaet/prompt-ui-components'

interface DropdownMenuItemForRecordActionProps {
  action: ActionOnParticipants
  rows: string[]
  onEnd?: () => void
}

export const DropdownMenuItemForActionOnParticipants = ({
  action,
  rows,
  onEnd,
}: DropdownMenuItemForRecordActionProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => {
    setIsOpen(false)
  }

  const open = () => {
    setIsOpen(true)
  }

  const disabled = action.singleRecordOnly === true && rows.length !== 1

  const handleTrigger = () => {
    if (disabled) {
      return
    }
    if (action.confirm) {
      open()
      return
    }
    action.onAction(rows)
    if (onEnd) {
      onEnd()
    }
  }

  const description =
    typeof action.confirm?.description === 'function'
      ? action.confirm.description(rows.length)
      : (action.confirm?.description ?? '')

  return (
    <>
      <DropdownMenuItem
        disabled={disabled}
        onSelect={(event) => {
          event.preventDefault()
          handleTrigger()
        }}
      >
        {action.icon}
        {action.label}
      </DropdownMenuItem>
      {/* Action Dialog */}
      {isOpen && action.confirm && (
        <ActionDialog
          title={action.confirm.title || ''}
          description={description}
          confirmLabel={action.confirm.confirmLabel || ''}
          isOpen={isOpen}
          onClose={close}
          onConfirm={() => {
            action.onAction(rows)
            if (onEnd) {
              onEnd()
            }
          }}
        />
      )}
    </>
  )
}
