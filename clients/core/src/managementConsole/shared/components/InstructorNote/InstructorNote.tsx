import { useState } from 'react'
import { InstructorNote as InstructorNoteType } from '../../interfaces/InstructorNote'
import {
  useDeleteInstructorNote,
  useCreateInstructorNote,
} from '@core/network/hooks/useInstructorNotes'
import { NoteWrapper } from './NoteWrapper'
import { NoteEditForm } from './NoteEditForm'
import { NoteVersionHistoryItem } from './NoteVersionHistoryItem'

type NoteProps = {
  note: InstructorNoteType
  studentId: string
}

export function InstructorNote({ note, studentId }: NoteProps) {
  const deleteNote = useDeleteInstructorNote(studentId)
  const createNote = useCreateInstructorNote(studentId)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [showVersions, setShowVersions] = useState(false)

  const isDeleted = note.dateDeleted != null
  const latestVersion = note.versions[note.versions.length - 1]
  const olderVersions = note.versions.slice(0, -1).reverse()

  const handleEdit = () => {
    setEditContent(latestVersion.content)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editContent.trim()) return
    try {
      await createNote.mutateAsync({ content: editContent.trim(), new: false, forNote: note.id })
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(note.id)
    }
  }

  return (
    <NoteWrapper
      note={note}
      isEditing={isEditing}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isDeleting={deleteNote.isPending}
      showVersions={showVersions}
      onToggleVersions={() => setShowVersions((p) => !p)}
    >
      {isDeleted ? (
        <p className='text-sm text-muted-foreground italic'>This note was deleted</p>
      ) : isEditing ? (
        <NoteEditForm
          content={editContent}
          onChange={setEditContent}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={createNote.isPending}
        />
      ) : (
        <p className='text-sm whitespace-pre-wrap'>{latestVersion.content}</p>
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
    </NoteWrapper>
  )
}
