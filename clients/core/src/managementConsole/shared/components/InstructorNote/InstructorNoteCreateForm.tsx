import { useState } from 'react'
import { Button, Textarea } from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { useCreateInstructorNote } from '@core/network/hooks/useInstructorNotes'
import { ProfilePicture } from '@/components/StudentProfilePicture'

interface InstructorNotesCreateFormProps {
  studentId: string
  className?: string
}

export function InstructorNotesCreateForm({
  studentId,
  className = '',
}: InstructorNotesCreateFormProps) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const createNote = useCreateInstructorNote(studentId)

  console.log(user)

  const handleSubmit = () => {
    if (!content.trim()) return

    createNote.mutate(
      {
        content: content.trim(),
        new: true,
      },
      {
        onSuccess: () => {
          setContent('')
        },
      },
    )
  }

  return (
    <div className={`flex gap-3 ${className}`}>
      <div>
        <ProfilePicture
          email={user?.email ?? ''}
          firstName={user?.firstName ?? ''}
          lastName={user?.lastName ?? ''}
        />
      </div>
      <div className='w-full'>
        <div className='text-sm font-medium'>
          <span className='font-semibold'>
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        <Textarea
          placeholder='Leave an instructor note'
          className='w-full mt-1'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className='flex justify-end items-center text-sm text-muted-foreground gap-3 mt-2'>
          <p>Notes are auditable. Edits and removals will be visible to others.</p>
          <Button onClick={handleSubmit} disabled={!content.trim() || createNote.isPending}>
            {createNote.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
