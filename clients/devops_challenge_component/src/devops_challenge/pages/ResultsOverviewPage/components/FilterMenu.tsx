import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'
import { DevProfileFilter } from '../interfaces/devProfileFilter'

interface FilterMenuProps {
  filters: DevProfileFilter
  setFilters: React.Dispatch<React.SetStateAction<DevProfileFilter>>
}

export const FilterMenu = ({ filters, setFilters }: FilterMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='ml-auto'>
          <Filter className='mr-2 h-4 w-4' />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Challenge Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.passed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              challengePassed: { ...filters.challengePassed, passed: checked },
            })
          }
        >
          Completed
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.notPassed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              challengePassed: { ...filters.challengePassed, notPassed: checked },
            })
          }
        >
          Not Completed
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.failed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              challengePassed: { ...filters.challengePassed, failed: checked },
            })
          }
        >
          Failed
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
