import { ReactNode, useState } from 'react'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { InstructorNote } from '../../interfaces/InstructorNote'
import { formatNoteDate } from '@core/utils/formatDate'
import { ProfilePicture } from '@/components/StudentProfilePicture'
import { NoteActionButtons } from './NoteActionButtons'
import { NoteEditForm } from './NoteEditForm'
import { NoteVersionHistoryItem } from './NoteVersionHistoryItem'

interface NoteWrapperProps {
  note: InstructorNote
  onSave: (content: string) => Promise<unknown>
  onDelete: () => void
  isSaving: boolean
  isDeleting: boolean
  children: ReactNode
}

function MetaSeparator() {
  return <span className='mx-1'>·</span>
}

export function NoteWrapper({
  note,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  children,
}: NoteWrapperProps) {
  const { user } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [showVersions, setShowVersions] = useState(false)

  const isOwner = user?.email === note.authorEmail
  const names = note.authorName.split(' ')
  const latestVersion = note.versions[note.versions.length - 1]
  const olderVersions = note.versions.slice(0, -1).reverse()

  const handleEdit = () => {
    setEditContent(latestVersion.content)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editContent.trim()) return
    try {
      await onSave(editContent.trim())
      setIsEditing(false)
      setEditContent('')
    } catch {
      // mutation error is handled upstream; keep the form open
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent('')
  }

  return (
    <div
      className={`flex gap-3 transition-all rounded-2xl ${showVersions ? 'bg-gray-50 p-2' : 'p-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ProfilePicture
        email={note.authorEmail}
        firstName={names[0]}
        lastName={names[names.length - 1]}
        size='md'
      />

      <div className='flex-1'>
        <div className='text-sm font-medium flex items-center justify-between'>
          <div>
            <span className='font-semibold'>{note.authorName}</span>
            <MetaSeparator />
            {formatNoteDate(latestVersion.dateCreated)}
            {!isEditing && note.versions.length > 1 && (
              <>
                <MetaSeparator />
                <span
                  className='text-blue-500 hover:cursor-pointer'
                  onClick={() => setShowVersions((p) => !p)}
                >
                  {showVersions ? 'hide edits' : 'edited'}
                </span>
              </>
            )}
          </div>

          {isOwner && (
            <NoteActionButtons
              isVisible={isHovered && !isEditing}
              onEdit={handleEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          )}
        </div>

        {note.dateDeleted != null ? (
          <p className='text-sm text-muted-foreground italic'>This note was deleted</p>
        ) : isEditing ? (
          <NoteEditForm
            content={editContent}
            onChange={setEditContent}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        ) : (
          children
        )}

        {!isEditing && showVersions && olderVersions.length > 0 && (
          <div className='mt-2 space-y-2 border-l-2 border-gray-200 pl-3'>
            {olderVersions.map((noteVersion) => (
              <NoteVersionHistoryItem
                key={noteVersion.id}
                content={noteVersion.content}
                dateCreated={noteVersion.dateCreated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
