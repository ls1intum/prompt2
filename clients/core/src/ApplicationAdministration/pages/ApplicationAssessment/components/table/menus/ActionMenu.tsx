import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'

interface ActionMenuProps {
  onViewApplication: () => void
  onDeleteApplication: () => void
}

export const ActionMenu = ({
  onViewApplication,
  onDeleteApplication,
}: ActionMenuProps): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-8 w-8 p-0 hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring'
        >
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='font-normal'>
          <span className='font-semibold'>Application Actions</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            onViewApplication()
          }}
          className='flex items-center cursor-pointer'
        >
          <Eye className='mr-2 h-4 w-4' />
          <span>View application</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(event) => {
            event.stopPropagation()
            onDeleteApplication()
          }}
          className='flex items-center cursor-pointer text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          <span>Delete application</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
