import React from 'react'
import { ColumnFiltersState } from '@tanstack/react-table'
import { FilterBadge } from '../../../FilterBadge'
import { getStatusString } from '@/utils/getStatusBadge'

interface ActiveFilterBadgesProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  columnFiltersState: ColumnFiltersState
  setColumnFiltersFn: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  table: any
}

/** Convert a column's header to a user-facing string */
function getHeaderLabel(column: any, table: any): string {
  if (!column) return ''

  const header = column.columnDef?.header

  if (typeof header === 'string') return header

  if (typeof header === 'function') {
    try {
      const rendered = header({ table, column, header: column })
      if (rendered?.props?.title) return rendered.props.title
      if (typeof rendered?.props?.children === 'string') {
        return rendered.props.children
      }
    } catch {}
  }

  // fallback: camelCase → "Camel Case"
  return column.id.replace(/([A-Z])/g, ' $1').replace(/^./, (c: string) => c.toUpperCase())
}

/** Format score filter display */
function formatScoreLabel(value: { min?: string; max?: string; noScore?: boolean }): string {
  const { min, max, noScore } = value

  if (noScore) return 'No score'
  if (min && max) return `${min}–${max}`
  if (min) return `≥ ${min}`
  if (max) return `≤ ${max}`
  return ''
}

/** Render the score filter badge */
function renderScoreBadge(
  value: any,
  headerLabel: string,
  setColumnFiltersFn: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
) {
  const label = formatScoreLabel(value)
  if (!label) return null

  return (
    <FilterBadge
      key='score-filter'
      label={`${headerLabel}: ${label}`}
      onRemove={() => setColumnFiltersFn((prev) => prev.filter((p) => p.id !== 'score'))}
    />
  )
}

/** Render badges for simple array-based filters */
function renderDefaultBadges(
  filter: any,
  headerLabel: string,
  setColumnFiltersFn: React.Dispatch<React.SetStateAction<ColumnFiltersState>>,
) {
  const values = Array.isArray(filter.value) ? filter.value : [filter.value]

  return values.map((val: any, idx: number) => {
    let valueLabel = String(val)

    // Pretty-print status values
    if (filter.id === 'passStatus') {
      try {
        valueLabel = getStatusString(val)
      } catch {}
    }

    const key = `${filter.id}-${idx}-${valueLabel}`

    const remove = () => {
      setColumnFiltersFn((prev) => {
        const existing = prev.find((f) => f.id === filter.id)
        if (!existing) return prev

        const existingValues = Array.isArray(existing.value) ? existing.value : [existing.value]

        const newValues = existingValues.filter((v) => String(v) !== String(val))

        if (newValues.length === 0) {
          return prev.filter((f) => f.id !== filter.id)
        }

        return prev.map((f) => (f.id === filter.id ? { ...f, value: newValues } : f))
      })
    }

    return <FilterBadge key={key} label={`${headerLabel}: ${valueLabel}`} onRemove={remove} />
  })
}

export const ActiveFilterBadges = ({
  globalFilter,
  setGlobalFilter,
  columnFiltersState,
  setColumnFiltersFn,
  table,
}: ActiveFilterBadgesProps) => {
  const hasActiveColumnFilters = columnFiltersState.some(
    (f) => f.value != null && String(f.value) !== '',
  )
  const hasAnyActiveFilters = Boolean(globalFilter) || hasActiveColumnFilters

  return (
    <div className='mt-2 mb-2 flex flex-wrap items-center gap-2 min-h-[1.3rem]'>
      {/* Global filter badge */}
      {globalFilter && (
        <FilterBadge label={`Search: "${globalFilter}"`} onRemove={() => setGlobalFilter('')} />
      )}

      {/* Column filter badges */}
      {hasAnyActiveFilters &&
        columnFiltersState.map((filter) => {
          if (!filter.value) return null

          const column = table.getColumn(filter.id)
          const headerLabel = getHeaderLabel(column, table)

          // Score object-based filter
          if (filter.id === 'score') {
            return renderScoreBadge(filter.value, headerLabel, setColumnFiltersFn)
          }

          // Default badges (arrays or single)
          return renderDefaultBadges(filter, headerLabel, setColumnFiltersFn)
        })}
    </div>
  )
}

export default ActiveFilterBadges
