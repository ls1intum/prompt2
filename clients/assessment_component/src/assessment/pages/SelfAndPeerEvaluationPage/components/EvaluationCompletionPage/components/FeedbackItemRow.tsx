import { Button, Textarea } from '@tumaet/prompt-ui-components'
import { MessageCircle, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { FeedbackItem } from '../../../../../interfaces/feedbackItem'

interface FeedbackItemRowProps {
  item: FeedbackItem
  value: string
  onTextChange: (itemId: string, value: string) => void
  onDelete: (itemId: string) => void
  isSaving: boolean
  isPending: boolean
  isDisabled?: boolean
  placeholder?: string
}

export function FeedbackItemRow({
  item,
  value,
  onTextChange,
  onDelete,
  isPending,
  isDisabled = false,
  placeholder = 'Enter feedback...',
}: FeedbackItemRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const iconColor = item.feedbackType === 'positive' ? 'text-green-600' : 'text-red-600'

  return (
    <div
      className={`flex items-center gap-2 p-2 border rounded-md group relative ${
        isDisabled ? 'opacity-60' : ''
      }`}
    >
      <MessageCircle className={`h-5 w-5 shrink-0 ${iconColor}`} />

      <div className='flex-1 relative'>
        <Textarea
          ref={textareaRef}
          className='w-full resize-none min-h-[24px]'
          value={value}
          onChange={(e) => {
            if (!isDisabled) {
              const cleanup = onTextChange(item.id, e.target.value)
              return cleanup
            }
          }}
          placeholder={isDisabled ? 'Assessment completed - editing disabled' : placeholder}
          rows={1}
          style={{
            height: 'auto',
            minHeight: '24px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
          disabled={isDisabled}
          readOnly={isDisabled}
        />
      </div>

      <Button
        variant='ghost'
        size='icon'
        className=''
        onClick={() => !isDisabled && onDelete(item.id)}
        disabled={isPending || isDisabled}
        title={isDisabled ? 'Assessment completed - editing disabled' : 'Delete feedback item'}
      >
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </div>
  )
}
