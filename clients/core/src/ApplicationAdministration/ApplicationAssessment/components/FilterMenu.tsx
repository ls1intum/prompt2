import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PassStatus } from '@/interfaces/course_phase_participation'
import { useState } from 'react'
import { getStatusBadge } from '../utils/getStatusBadge'
import { ColumnFiltersState } from '@tanstack/react-table'
import { Gender, getGenderString } from '@/interfaces/gender'

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
    return Object.keys(items).map((key) => {
      const value = items[key]
      return (
        <DropdownMenuCheckboxItem
          key={key}
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderFilterItems('pass_status', PassStatus, getStatusBadge)}

        <DropdownMenuLabel>Gender</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderFilterItems('gender', Gender, getGenderString)}

        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
