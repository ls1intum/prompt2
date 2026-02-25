import { PropsWithChildren } from 'react'
import { NoteTag } from '../../interfaces/InstructorNote'

export function InstructorNoteTag(props: PropsWithChildren) {
  return (
    <div className='text-xs border-l-2 border-green-600 text-gray-600 pl-1 text-nowrap whitespace-nowrap inline-block bg-gradient-to-r from-green-200 to-transparent'>
      {props.children}
    </div>
  )
}

export function InstructorNoteTags({ tags }: { tags: NoteTag[] }) {
  return tags.map((tag: NoteTag) => <InstructorNoteTag key={tag.id}>{tag.name}</InstructorNoteTag>)
}
