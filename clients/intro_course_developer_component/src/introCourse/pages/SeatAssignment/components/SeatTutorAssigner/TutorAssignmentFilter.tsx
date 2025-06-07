import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { Filter } from 'lucide-react'

interface TutorAssignmentFilterProps {
  filterOptions: {
    showAssigned: boolean
    showUnassigned: boolean
    showWithMac: boolean
    showWithoutMac: boolean
  }
  setFilterOptions: (filterOptions: {
    showAssigned: boolean
    showUnassigned: boolean
    showWithMac: boolean
    showWithoutMac: boolean
  }) => void
}

export const TutorAssignmentFilter = ({
  filterOptions,
  setFilterOptions,
}: TutorAssignmentFilterProps): JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='gap-1'>
          <Filter className='h-4 w-4' />
          <span className='hidden sm:inline'>Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuCheckboxItem
          checked={filterOptions.showAssigned}
          onCheckedChange={(checked) =>
            setFilterOptions({ ...filterOptions, showAssigned: checked })
          }
        >
          Show Assigned Seats
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filterOptions.showUnassigned}
          onCheckedChange={(checked) =>
            setFilterOptions({ ...filterOptions, showUnassigned: checked })
          }
        >
          Show Unassigned Seats
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filterOptions.showWithMac}
          onCheckedChange={(checked) =>
            setFilterOptions({ ...filterOptions, showWithMac: checked })
          }
        >
          Show Seats with Mac
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filterOptions.showWithoutMac}
          onCheckedChange={(checked) =>
            setFilterOptions({ ...filterOptions, showWithoutMac: checked })
          }
        >
          Show Seats without Mac
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
