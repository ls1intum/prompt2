import {
  Input,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tumaet/prompt-ui-components'
import { PassStatus, Gender, getGenderString } from '@tumaet/prompt-shared-state'
import { getStatusBadge } from '../../../utils/getStatusBadge'
import { ColumnFiltersState } from '@tanstack/react-table'
import { Filter } from 'lucide-react'

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
        <DropdownMenuCheckboxItem
          key={value}
          checked={isSelected(id, value)}
          onClick={(e) => {
            e.preventDefault()
            handleFilterChange(id, value)
          }}
        >
          {getDisplay(value)}
        </DropdownMenuCheckboxItem>
      )
    })
  }

  const assessmentScoreFilter = columnFilters.find((f) => f.id === 'score')
  const assessmentScoreValue =
    assessmentScoreFilter && typeof assessmentScoreFilter.value === 'object'
      ? (assessmentScoreFilter.value as {
          min?: string
          max?: string
          noScore?: boolean
        })
      : {}

  const setAssessmentScoreFilter = (
    updates: Partial<{ min?: string; max?: string; noScore?: boolean }>,
  ) => {
    setColumnFilters((prevFilters) => {
      const existing = prevFilters.find((filter) => filter.id === 'score')

      const newValue = {
        ...(existing?.value || {}),
        ...updates,
      }
      // If user toggled noScore on, reset min/max
      if (updates.noScore === true) {
        newValue.min = ''
        newValue.max = ''
      }
      // If user changes min or max, automatically disable noScore
      if (typeof updates.min !== 'undefined' || typeof updates.max !== 'undefined') {
        newValue.noScore = false
      }

      // If all fields in newValue are empty/false, remove the filter entirely
      const isEmpty = !newValue.min && !newValue.max && !newValue.noScore
      if (isEmpty) {
        return prevFilters.filter((filter) => filter.id !== 'score')
      }

      // Otherwise, update or create the filter
      if (existing) {
        return prevFilters.map((filter) =>
          filter.id === 'score' ? { ...filter, value: newValue } : filter,
        )
      } else {
        return [...prevFilters, { id: 'score', value: newValue }]
      }
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

        <DropdownMenuLabel>Gender</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderFilterItems('gender', Gender, getGenderString)}

        <DropdownMenuLabel>Assessment Score</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className='p-2 space-y-2'>
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              placeholder='Min'
              value={assessmentScoreValue.min ?? ''}
              onChange={(e) => setAssessmentScoreFilter({ min: e.target.value })}
              className='w-full'
            />
            <Input
              type='number'
              placeholder='Max'
              value={assessmentScoreValue.max ?? ''}
              onChange={(e) => setAssessmentScoreFilter({ max: e.target.value })}
              className='w-full'
            />
          </div>
          <DropdownMenuCheckboxItem
            checked={assessmentScoreValue.noScore || false}
            onClick={(e) => {
              e.preventDefault()
              setAssessmentScoreFilter({ noScore: !assessmentScoreValue.noScore })
            }}
          >
            No Score
          </DropdownMenuCheckboxItem>
        </div>

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
