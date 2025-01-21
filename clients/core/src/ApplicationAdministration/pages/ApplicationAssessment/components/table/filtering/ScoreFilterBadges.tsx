import { Badge } from '@/components/ui/badge'
import { ColumnFiltersState } from '@tanstack/react-table'
import { X } from 'lucide-react'

export interface ScoreFilters {
  min?: string
  max?: string
  noScore?: boolean
}

interface ScoreFilterBadgesProps {
  filter: ScoreFilters
  onRemoveFilter: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
}

export const ScoreFilterBadges = ({ filter, onRemoveFilter }: ScoreFilterBadgesProps) => {
  const removeFilter = (field: 'min' | 'max' | 'noScore') => {
    onRemoveFilter((prevFilters) => {
      return prevFilters
        .map((oldFilter) => {
          // Only modify the 'score' filter
          if (oldFilter.id === 'score' && typeof oldFilter.value === 'object') {
            const newValue = { ...oldFilter.value } as ScoreFilters
            // Remove the selected field
            delete newValue[field]

            const isEmpty = !newValue.min && !newValue.max && !newValue.noScore
            if (isEmpty) {
              return null
            }

            return { ...oldFilter, value: newValue }
          }

          return oldFilter
        })
        .filter(Boolean) as ColumnFiltersState
    })
  }

  return (
    <>
      {filter.min && (
        <Badge
          variant='secondary'
          key='filter-min'
          className='cursor-pointer flex items-center gap-1'
          onClick={() => removeFilter('min')}
        >
          <X className='h-3 w-3' />
          Min Score: {filter.min}
        </Badge>
      )}

      {filter.max && (
        <Badge
          variant='secondary'
          key='filter-max'
          className='cursor-pointer flex items-center gap-1'
          onClick={() => removeFilter('max')}
        >
          <X className='h-3 w-3' />
          Max Score: {filter.max}
        </Badge>
      )}

      {filter.noScore && (
        <Badge
          variant='secondary'
          key='filter-noScore'
          className='cursor-pointer flex items-center gap-1'
          onClick={() => removeFilter('noScore')}
        >
          <X className='h-3 w-3' />
          No Score
        </Badge>
      )}
    </>
  )
}
