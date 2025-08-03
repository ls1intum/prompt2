import { Badge } from '@tumaet/prompt-ui-components'
import { X } from 'lucide-react'
import { Gender, getGenderString } from '@tumaet/prompt-shared-state'
import { StatisticsFilter } from './FilterMenu'

interface FilterBadgesProps {
  filters: StatisticsFilter
  onRemoveFilter: React.Dispatch<React.SetStateAction<StatisticsFilter>>
}

export const FilterBadges = ({ filters, onRemoveFilter }: FilterBadgesProps) => {
  const handleRemoveGradeFilter = (key: 'hasGrade' | 'noGrade') => {
    onRemoveFilter((prevFilters) => ({
      ...prevFilters,
      [key]: false,
    }))
  }

  const handleRemoveGenderFilter = (gender: Gender) => {
    onRemoveFilter((prevFilters) => {
      const currentGenders = prevFilters.genders || []
      const newGenders = currentGenders.filter((g) => g !== gender)
      return {
        ...prevFilters,
        genders: newGenders.length > 0 ? newGenders : undefined,
      }
    })
  }

  const handleRemoveSemesterFilter = () => {
    onRemoveFilter((prevFilters) => {
      const newFilters = { ...prevFilters }
      delete newFilters.semester
      return newFilters
    })
  }

  const activeBadges: Array<{ key: string; label: string; onRemove: () => void }> = []

  if (filters.hasGrade) {
    activeBadges.push({
      key: 'hasGrade',
      label: 'Has Grade',
      onRemove: () => handleRemoveGradeFilter('hasGrade'),
    })
  }

  if (filters.noGrade) {
    activeBadges.push({
      key: 'noGrade',
      label: 'No Grade',
      onRemove: () => handleRemoveGradeFilter('noGrade'),
    })
  }

  if (filters.genders) {
    filters.genders.forEach((gender) => {
      activeBadges.push({
        key: `gender-${gender}`,
        label: `Gender: ${getGenderString(gender)}`,
        onRemove: () => handleRemoveGenderFilter(gender),
      })
    })
  }

  if (filters.semester && (filters.semester.min || filters.semester.max)) {
    const semesterLabel = `Semester: ${filters.semester.min || '?'} - ${filters.semester.max || '?'}`
    activeBadges.push({
      key: 'semester',
      label: semesterLabel,
      onRemove: handleRemoveSemesterFilter,
    })
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {activeBadges.map(({ key, label, onRemove }) => (
        <Badge
          variant='secondary'
          key={key}
          className='cursor-pointer flex items-center gap-1'
          onClick={onRemove}
        >
          <X className='h-3 w-3' />
          {label}
        </Badge>
      ))}
    </div>
  )
}
