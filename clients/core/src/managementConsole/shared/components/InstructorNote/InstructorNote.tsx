import { InstructorNote } from '../../interfaces/InstructorNote'
import {
  useDeleteInstructorNote,
  useCreateInstructorNote,
} from '@core/network/hooks/useInstructorNotes'
import { NoteWrapper } from './NoteWrapper'

type NoteProps = {
  note: InstructorNote
  studentId: string
}

export function InstructorNote({ note, studentId }: NoteProps) {
  const deleteNote = useDeleteInstructorNote(studentId)
  const createNote = useCreateInstructorNote(studentId)

  const latestVersion = note.versions[note.versions.length - 1]

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(note.id)
    }
  }

  const handleSave = (content: string) =>
    createNote.mutateAsync({ content, new: false, forNote: note.id })

  return (
    <NoteWrapper
      note={note}
      onSave={handleSave}
      onDelete={handleDelete}
      isSaving={createNote.isPending}
      isDeleting={deleteNote.isPending}
    >
      <p className='text-sm whitespace-pre-wrap'>{latestVersion.content}</p>
    </NoteWrapper>
  )
}
