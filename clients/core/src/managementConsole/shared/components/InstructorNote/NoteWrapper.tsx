import { ReactNode, useState } from 'react'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { InstructorNote } from '../../interfaces/InstructorNote'
import { formatNoteDate } from '@core/utils/formatDate'
import { ProfilePicture } from '@/components/StudentProfilePicture'
import { NoteActionButtons } from './NoteActionButtons'

interface NoteWrapperProps {
  note: InstructorNote
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  showVersions?: boolean
  onToggleVersions?: () => void
  children: ReactNode
}

function MetaSeparator() {
  return <span className='mx-1'>·</span>
}

export function NoteWrapper({
  note,
  isEditing,
  onEdit,
  onDelete,
  isDeleting,
  showVersions,
  onToggleVersions,
  children,
}: NoteWrapperProps) {
  const { user } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  const isOwner = user?.email === note.authorEmail
  const isDeleted = note.dateDeleted != null
  const names = note.authorName.split(' ')
  const latestVersion = note.versions[note.versions.length - 1]

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
            {!isEditing && note.versions.length > 1 && onToggleVersions && (
              <>
                <MetaSeparator />
                <span className='text-blue-500 hover:cursor-pointer' onClick={onToggleVersions}>
                  {showVersions ? 'hide edits' : 'edited'}
                </span>
              </>
            )}
          </div>

          {isOwner && !isDeleted && (
            <NoteActionButtons
              isVisible={isHovered && !isEditing}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          )}
        </div>

        {children}
      </div>
    </div>
  )
}
