import { Button, Textarea } from '@tumaet/prompt-ui-components'

interface NoteEditFormProps {
  content: string
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}

export function NoteEditForm({
  content,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: NoteEditFormProps) {
  return (
    <div className='space-y-2'>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className='w-full min-h-[80px]'
        autoFocus
      />
      <div className='flex justify-end gap-2'>
        <Button variant='ghost' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button size='sm' onClick={onSave} disabled={!content.trim() || isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
