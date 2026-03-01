import { NoteTag, NoteTagColor } from '../../interfaces/InstructorNote'

const transitionFromTagColor: Record<NoteTagColor, string> = {
  green: 'from-green-200 border-green-600 dark:from-green-800',
  blue: 'from-blue-200 border-blue-600 dark:from-blue-800',
  red: 'from-red-200 border-red-600 dark:from-red-800',
  yellow: 'from-yellow-200 border-yellow-600 dark:from-yellow-800',
  orange: 'from-orange-200 border-orange-600 dark:from-orange-800',
  pink: 'from-pink-200 border-pink-600 dark:from-pink-800',
}

const bgFromTagColor: Record<NoteTagColor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
}

export function InstructorNoteTag({ tag }: { tag: NoteTag }) {
  return (
    <div
      className={
        'text-xs border-l-2 text-gray-600 dark:text-gray-200 pl-1 text-nowrap whitespace-nowrap inline-block bg-gradient-to-r to-transparent ' +
        transitionFromTagColor[tag.color]
      }
    >
      {tag.name}
    </div>
  )
}

export function InstructorNoteTagColor({ color }: { color: NoteTagColor }) {
  return (
    <div className='flex items-center gap-2'>
      <span className={`inline-block h-3 w-3 rounded-full ${bgFromTagColor[color]}`} />
      <span className='capitalize'>{color}</span>
    </div>
  )
}

export function InstructorNoteTags({ tags }: { tags: NoteTag[] }) {
  return (
    <div className='flex gap-2'>
      {tags.map((tag: NoteTag) => (
        <InstructorNoteTag key={tag.id} tag={tag} />
      ))}
    </div>
  )
}
