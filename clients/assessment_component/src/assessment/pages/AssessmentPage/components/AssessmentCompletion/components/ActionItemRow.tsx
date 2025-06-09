import { Button, Textarea } from '@tumaet/prompt-ui-components'
import { Check, Trash2 } from 'lucide-react'

import type { ActionItem } from '../../../../../interfaces/actionItem'

interface ActionItemRowProps {
  item: ActionItem
  value: string
  onTextChange: (itemId: string, value: string) => void
  onDelete: (itemId: string) => void
  isSaving: boolean
  isPending: boolean
}

export function ActionItemRow({
  item,
  value,
  onTextChange,
  onDelete,
  isPending,
}: ActionItemRowProps) {
  return (
    <div className='flex items-center gap-2 p-2 border rounded-md group relative'>
      <Check className='h-5 w-5 shrink-0 text-green-600' />

      <div className='flex-1 relative'>
        <Textarea
          className='w-full resize-none min-h-[24px]'
          value={value}
          onChange={(e) => {
            const cleanup = onTextChange(item.id, e.target.value)
            return cleanup
          }}
          placeholder='Enter action item...'
          rows={1}
          style={{
            height: 'auto',
            minHeight: '24px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = target.scrollHeight + 'px'
          }}
        />
      </div>

      <Button
        variant='ghost'
        size='icon'
        className='opacity-0 group-hover:opacity-100 transition-opacity'
        onClick={() => onDelete(item.id)}
        disabled={isPending}
        title='Delete action item'
      >
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </div>
  )
}
