import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FilterCondition = 'equals' | 'contains' | 'startsWith' | 'endsWith'

interface Filter {
  column: string
  condition: FilterCondition
  value: string
}

interface FilterBuilderProps {
  columns: { accessorKey: string; header: string }[]
  onApplyFilters: (filters: Filter[]) => void
}

export function FilterBuilder({ columns, onApplyFilters }: FilterBuilderProps) {
  const [filters, setFilters] = useState<Filter[]>([])
  const [currentFilter, setCurrentFilter] = useState<Filter>({
    column: '',
    condition: 'equals',
    value: '',
  })

  const addFilter = () => {
    if (currentFilter.column && currentFilter.condition && currentFilter.value) {
      setFilters((prevFilters) => {
        const newFilters = [...prevFilters, currentFilter]
        onApplyFilters(newFilters)
        return newFilters
      })
      setCurrentFilter({ column: '', condition: 'equals', value: '' })
    }
  }

  const removeFilter = (index: number) => {
    setFilters((prevFilers) => {
      const newFilters = prevFilers.filter((_, i) => i !== index)
      onApplyFilters(newFilters)
      return newFilters
    })
  }

  return (
    <div className='space-y-4'>
      <div className='flex space-x-2'>
        <Select
          value={currentFilter.column}
          onValueChange={(value) => setCurrentFilter({ ...currentFilter, column: value })}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select column' />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column.accessorKey} value={column.accessorKey}>
                {column.accessorKey}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilter.condition}
          onValueChange={(value) =>
            setCurrentFilter({ ...currentFilter, condition: value as FilterCondition })
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select condition' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='equals'>Equals</SelectItem>
            <SelectItem value='contains'>Contains</SelectItem>
            <SelectItem value='startsWith'>Starts with</SelectItem>
            <SelectItem value='endsWith'>Ends with</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type='text'
          placeholder='Enter value'
          value={currentFilter.value}
          onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.value })}
        />
        <Button onClick={addFilter}>Add Filter</Button>
      </div>
      <div className='space-y-2'>
        {filters.map((filter, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <Label>{`${filter.column} ${filter.condition} "${filter.value}"`}</Label>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => {
                removeFilter(index)
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
