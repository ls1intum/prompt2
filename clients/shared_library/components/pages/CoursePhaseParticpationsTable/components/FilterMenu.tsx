import {
  Button,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { PassStatus } from '@tumaet/prompt-shared-state'
import { getStatusBadge } from '@/utils/getStatusBadge'
import { ColumnFiltersState } from '@tanstack/react-table'
import { Filter, Check } from 'lucide-react'

interface ColumnFiltersProps {
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

export const FilterMenu = ({
  columnFilters,
  setColumnFilters,
}: ColumnFiltersProps): JSX.Element => {
  const isSelected = <T extends string>(id: string, value: T) => {
    return columnFilters.some(
      (filter) => filter.id === id && Array.isArray(filter.value) && filter.value.includes(value),
    )
  }

  const handleFilterChange = <T extends string>(id: string, value: T) => {
    setColumnFilters((prevFilters) => {
      const existingFilter = prevFilters.find((filter) => filter.id === id)

      if (existingFilter && Array.isArray(existingFilter.value)) {
        const updatedValue = existingFilter.value.includes(value)
          ? existingFilter.value.filter((v) => v !== value) // Remove if exists
          : [...existingFilter.value, value] // Add if not exists

        return updatedValue.length > 0
          ? prevFilters.map((filter) =>
              filter.id === id ? { ...filter, value: updatedValue } : filter,
            )
          : prevFilters.filter((filter) => filter.id !== id) // Remove filter if no values
      } else {
        return [...prevFilters, { id, value: [value] }]
      }
    })
  }

  const renderFilterItems = <T extends string>(
    id: string,
    items: Record<string, T>,
    getDisplay: (value: T) => React.ReactNode,
  ) => {
    return Object.values(items).map((value) => {
      return (
        <DropdownMenuItem
          key={value}
          onClick={(e) => {
            e.preventDefault()
            handleFilterChange(id, value)
          }}
          className='flex items-center justify-between w-full px-3 py-1.5 cursor-pointer'
        >
          <span className='text-sm'>{getDisplay(value)}</span>
          {isSelected(id, value) && <Check className='h-4 w-4 text-primary' />}
        </DropdownMenuItem>
      )
    })
  }

  const resetFilters = () => {
    setColumnFilters([])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='justify-start'>
          <Filter className='mr-2 h-4 w-4' />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Assessment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderFilterItems('passStatus', PassStatus, getStatusBadge)}

        <DropdownMenuSeparator />
        <div className='p-2'>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-center'
            onClick={(e) => {
              e.preventDefault()
              resetFilters()
            }}
            disabled={!(columnFilters.length > 0)}
          >
            Clear Filters
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
