import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export const SortableHeader = ({ column, title }: { column: any; title: string }) => {
  return (
    <button
      type='button'
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className='flex items-center hover:cursor-pointer'
    >
      {title}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className='ml-2 h-4 w-4' />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className='ml-2 h-4 w-4' />
      ) : (
        <ArrowUpDown className='ml-2 h-4 w-4' />
      )}
    </button>
  )
}
