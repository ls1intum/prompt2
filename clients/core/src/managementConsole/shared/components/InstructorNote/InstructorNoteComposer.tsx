import { useState } from 'react'
import {
  Button,
  Textarea,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tumaet/prompt-ui-components'
import { Check, Send, Tag } from 'lucide-react'
import { InstructorNoteTag } from './InstructorNoteTag'
import { NoteTag } from '../../interfaces/InstructorNote'
import { useNoteTags } from '@core/network/hooks/useInstructorNoteTags'

const isMac = /Mac/i.test(navigator.platform)
const submitShortcut = isMac ? '⌘↵' : 'Ctrl+↵'

interface NoteComposerProps {
  onSubmit: (content: string, tagIds: string[]) => Promise<void>
  isPending: boolean
  onCancel?: () => void
  initialContent?: string
  initialTags?: NoteTag[]
  autoFocus?: boolean
}

export function NoteComposer({
  onSubmit,
  isPending,
  onCancel,
  initialContent = '',
  initialTags = [],
  autoFocus,
}: NoteComposerProps) {
  const [content, setContent] = useState(initialContent)
  const [selectedTags, setSelectedTags] = useState<NoteTag[]>(initialTags)
  const { data: availableTags = [] } = useNoteTags()

  const sendUnavailable = !content.trim() || isPending
  const isEditMode = onCancel !== undefined

  const toggleTag = (tag: NoteTag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag],
    )
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    try {
      await onSubmit(
        content.trim(),
        selectedTags.map((t) => t.id),
      )
      setContent('')
      setSelectedTags([])
    } catch {
      // error handled upstream; keep form open
    }
  }

  const tagPicker = (
    <Popover>
      <PopoverTrigger asChild>
        <button className='flex items-center gap-1 text-xs text-muted-foreground rounded px-1.5 py-0.5 hover:bg-gray-100 hover:text-foreground'>
          <Tag className='w-3 h-3' />
          <span>tag</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-1' align='start'>
        {availableTags.length === 0 ? (
          <p className='text-xs text-muted-foreground px-2 py-1'>No tags available</p>
        ) : (
          availableTags.map((tag) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag)}
                className='flex items-center gap-2 w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors'
              >
                <Check className={`w-3 h-3 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                <InstructorNoteTag tag={tag} />
              </button>
            )
          })
        )}
      </PopoverContent>
    </Popover>
  )

  return (
    <div className='space-y-1.5'>
      {selectedTags.length > 0 && (
        <div className='flex items-center flex-wrap gap-1'>
          {selectedTags.map((tag) => (
            <InstructorNoteTag key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <Textarea
        placeholder={isEditMode ? undefined : 'Leave an instructor note'}
        className='w-full focus-visible:ring-0 focus-visible:ring-offset-0'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
        }}
      />

      <div className='flex items-center justify-between'>
        {tagPicker}
        {isEditMode ? (
          <div className='flex gap-2'>
            <Button variant='ghost' size='sm' onClick={onCancel}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSubmit} disabled={sendUnavailable}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <p className={`font-bold ${sendUnavailable ? '' : 'text-black'}`}>{submitShortcut}</p>
            <p>or</p>
            <Button size='sm' onClick={handleSubmit} disabled={sendUnavailable}>
              <Send />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
