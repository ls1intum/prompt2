import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { ApplicationParticipation } from '../../../../../interfaces/applicationParticipation'
import { Column } from '@tanstack/react-table'
import { Columns } from 'lucide-react'

interface VisibilityMenuProps {
  columns: Column<ApplicationParticipation, unknown>[]
}

export const VisibilityMenu = ({ columns }: VisibilityMenuProps): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='ml-auto'>
          <Columns className='mr-2 h-4 w-4' />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {columns
          .filter((column) => column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onClick={(e) => {
                  e.preventDefault()
                  column.toggleVisibility(!column.getIsVisible())
                }}
              >
                {column.id.replace(/_/g, ' ')}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
