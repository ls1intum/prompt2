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
        <Button variant='outline' className='ml-auto'>
          <Filter className='h-4 w-4' />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>Assessment</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.passed.passed}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              passed: { ...prevFilters.passed, passed: checked },
            }))
          }
        >
          {getStatusBadge(PassStatus.PASSED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.passed.notAssessed}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              passed: { ...prevFilters.passed, notAssessed: checked },
            }))
          }
        >
          {getStatusBadge(PassStatus.NOT_ASSESSED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.passed.failed}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              passed: { ...prevFilters.passed, failed: checked },
            }))
          }
        >
          {getStatusBadge(PassStatus.FAILED)}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Challenge Status</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.passed}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              challengePassed: { ...prevFilters.challengePassed, passed: checked },
            }))
          }
        >
          {getChallengeStatusBadgeFromString('passed')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.notPassed}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              challengePassed: { ...prevFilters.challengePassed, notPassed: checked },
            }))
          }
        >
          {getChallengeStatusBadgeFromString('notCompleted')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.challengePassed.unknown}
          onCheckedChange={(checked) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              challengePassed: { ...prevFilters.challengePassed, unknown: checked },
            }))
          }
        >
          {getChallengeStatusBadgeFromString('')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
