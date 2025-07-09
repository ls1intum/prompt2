import { Button, Textarea } from '@tumaet/prompt-ui-components'
import { Check, MessageCircle, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { ActionItem } from '../../interfaces/actionItem'
import type { FeedbackItem } from '../../interfaces/feedbackItem'

interface BaseItemRowProps {
  value: string
  onTextChange: (itemId: string, value: string) => void
  onDelete: (itemId: string) => void
  isSaving: boolean
  isPending: boolean
  isDisabled?: boolean
  placeholder?: string
}

interface ActionItemRowProps extends BaseItemRowProps {
  type: 'action'
  item: ActionItem
}

interface FeedbackItemRowProps extends BaseItemRowProps {
  type: 'feedback'
  item: FeedbackItem
}

type ItemRowProps = ActionItemRowProps | FeedbackItemRowProps

export function ItemRow({
  type,
  item,
  value,
  onTextChange,
  onDelete,
  isPending,
  isDisabled = false,
  placeholder,
}: ItemRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  // Determine icon and color based on type
  const getIconAndColor = () => {
    if (type === 'action') {
      return {
        Icon: Check,
        colorClass: 'text-green-600',
      }
    } else {
      // feedback type
      const feedbackItem = item as FeedbackItem
      return {
        Icon: MessageCircle,
        colorClass: feedbackItem.feedbackType === 'positive' ? 'text-green-600' : 'text-red-600',
      }
    }
  }

  // Default placeholders based on type
  const getDefaultPlaceholder = () => {
    if (placeholder) return placeholder
    if (isDisabled) return 'Assessment completed - editing disabled'
    return type === 'action' ? 'Enter action item...' : 'Enter feedback...'
  }

  // Get delete button title
  const getDeleteTitle = () => {
    if (isDisabled) return 'Assessment completed - editing disabled'
    return type === 'action' ? 'Delete action item' : 'Delete feedback item'
  }

  const { Icon, colorClass } = getIconAndColor()

  return (
    <div
      className={`flex items-center gap-2 p-2 border rounded-md group relative ${
        isDisabled ? 'opacity-60' : ''
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} />

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
          placeholder={getDefaultPlaceholder()}
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
        title={getDeleteTitle()}
      >
        <Trash2 className='h-4 w-4 text-destructive' />
      </Button>
    </div>
  )
}
