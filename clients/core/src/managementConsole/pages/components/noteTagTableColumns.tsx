import { ColumnDef } from '@tanstack/react-table'
import { NoteTag } from '../../shared/interfaces/InstructorNote'
import { InstructorNoteTag } from '../../shared/components/InstructorNote/InstructorNoteTag'

export const noteTagTableColumns: ColumnDef<NoteTag>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => <InstructorNoteTag tag={row.original} />,
  },
]
