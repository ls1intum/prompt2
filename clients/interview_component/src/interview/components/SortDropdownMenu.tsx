import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { ArrowUpDown } from 'lucide-react'

interface SortDropdownMenuProps {
  sortBy: string | undefined
  setSortBy: (value: string) => void
}

export const SortDropdownMenu = ({ sortBy, setSortBy }: SortDropdownMenuProps): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>
          <ArrowUpDown className='h-4 w-4' />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          onClick={() => setSortBy('First Name')}
          checked={sortBy === 'First Name'}
        >
          First Name
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => setSortBy('Last Name')}
          checked={sortBy === 'Last Name'}
        >
          Last Name
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortBy === 'Acceptance Status'}
          onClick={() => setSortBy('Acceptance Status')}
        >
          Acceptance Status
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortBy === 'Interview Date'}
          onClick={() => setSortBy('Interview Date')}
        >
          Interview Date
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortBy === 'Interview Score'}
          onClick={() => setSortBy('Interview Score')}
        >
          Interview Score
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
