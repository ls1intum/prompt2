import { NoteTag, NoteTagColor } from '../../interfaces/InstructorNote'

const classFromTagColor: Record<NoteTagColor, string> = {
  green: 'from-green-200 border-green-600',
  blue: 'from-blue-200 border-blue-600',
  red: 'from-red-200 border-red-600',
  yellow: 'from-yellow-200 border-yellow-600',
  orange: 'from-orange-200 border-orange-600',
  pink: 'from-pink-200 border-pink-600',
}

export function InstructorNoteTag({ tag }: { tag: NoteTag }) {
  return (
    <div
      className={
        'text-xs border-l-2 text-gray-600 pl-1 text-nowrap whitespace-nowrap inline-block bg-gradient-to-r to-transparent ' +
        classFromTagColor[tag.color]
      }
    >
      {tag.name}
    </div>
  )
}

export function InstructorNoteTags({ tags }: { tags: NoteTag[] }) {
  return tags.map((tag: NoteTag) => <InstructorNoteTag key={tag.id} tag={tag} />)
}
