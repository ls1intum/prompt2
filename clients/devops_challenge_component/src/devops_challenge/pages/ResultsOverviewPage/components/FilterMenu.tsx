import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'

import { PassStatus } from '@tumaet/prompt-shared-state'

import { Button } from '@/components/ui/button'
import { getStatusBadge } from '@/utils/getStatusBadge'

import { DevProfileFilter } from '../interfaces/devProfileFilter'
import { getChallengeStatusBadgeFromString } from '../utils/getChallengeStatusBadge'

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
        <DropdownMenuLabel>Assessment</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.passed.passed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              passed: { ...filters.passed, passed: checked },
            })
          }
        >
          {getStatusBadge(PassStatus.PASSED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.passed.notAssessed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              passed: { ...filters.passed, notAssessed: checked },
            })
          }
        >
          {getStatusBadge(PassStatus.NOT_ASSESSED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.passed.failed}
          onCheckedChange={(checked) =>
            setFilters({
              ...filters,
              passed: { ...filters.passed, failed: checked },
            })
          }
        >
          {getStatusBadge(PassStatus.FAILED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
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
          {getChallengeStatusBadgeFromString('passed')}
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
          {getChallengeStatusBadgeFromString('notCompleted')}
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
          {getChallengeStatusBadgeFromString('failed')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
