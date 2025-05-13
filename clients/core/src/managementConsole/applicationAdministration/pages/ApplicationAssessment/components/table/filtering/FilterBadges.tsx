import { ColumnFiltersState } from '@tanstack/react-table'
import { Badge } from '@tumaet/prompt-ui-components'
import { PassStatus, Gender, getGenderString } from '@tumaet/prompt-shared-state'
import { getStatusString } from '../../../utils/getStatusBadge'
import { X } from 'lucide-react'
import { ScoreFilterBadges, ScoreFilters } from './ScoreFilterBadges'

interface FilterBadgesProps {
  filters: ColumnFiltersState
  onRemoveFilter: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

const getDisplayString = (id: string, value: string): string => {
  if (id.includes('passStatus')) {
    return `Status: ${getStatusString(value as PassStatus)}`
  } else if (id.includes('gender')) {
    return `Gender: ${getGenderString(value as Gender)}`
  } else {
    return `${id.toLocaleUpperCase}: ${value}`
  }
}

export const FilterBadges = ({ filters, onRemoveFilter }: FilterBadgesProps) => {
  const handleRemoveFilter = (filterId: string, value: string) => {
    onRemoveFilter((prevFilters) => {
      const updatedFilters = prevFilters.map((filter) => {
        if (filter.id === filterId && Array.isArray(filter.value)) {
          const updatedValue = filter.value.filter((v) => v !== value)
          return updatedValue.length > 0 ? { ...filter, value: updatedValue } : null // Remove filter if no values are left
        }
        return filter
      })

      return updatedFilters.filter((filter) => filter !== null) as ColumnFiltersState
    })
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {filters.map((filter) =>
        filter.id === 'score' ? (
          <ScoreFilterBadges
            key={filter.id}
            filter={filter.value as ScoreFilters}
            onRemoveFilter={onRemoveFilter}
          />
        ) : Array.isArray(filter.value) ? (
          filter.value.map((value) => (
            <Badge
              variant='secondary'
              key={`${filter.id}-${value}`}
              className='cursor-pointer flex items-center gap-1'
              onClick={() => handleRemoveFilter(filter.id, value)}
            >
              <X className='h-3 w-3' />
              {getDisplayString(filter.id, value)}
            </Badge>
          ))
        ) : (
          <Badge
            variant='secondary'
            key={filter.id}
            className='cursor-pointer flex items-center gap-1'
            onClick={() => handleRemoveFilter(filter.id, filter.value as string)}
          >
            <X className='h-3 w-3' />
            {getDisplayString(filter.id, filter.value as string)}
          </Badge>
        ),
      )}
    </div>
  )
}
