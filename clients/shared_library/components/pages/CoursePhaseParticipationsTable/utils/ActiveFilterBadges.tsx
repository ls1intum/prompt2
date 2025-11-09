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

export const ActiveFilterBadges = ({
  globalFilter,
  setGlobalFilter,
  columnFiltersState,
  setColumnFiltersFn,
  table,
}: ActiveFilterBadgesProps) => {
  const hasActiveColumnFilters = columnFiltersState.some(
    (f) => f.value != null && String(Array.isArray(f.value) ? f.value.join('') : f.value) !== '',
  )
  const hasAnyActiveFilters = Boolean(globalFilter) || hasActiveColumnFilters

  return (
    <div className='mt-4 mb-2 flex flex-wrap items-center gap-2 min-h-[1.3rem]'>
      {globalFilter && (
        <FilterBadge label={`Search: "${globalFilter}"`} onRemove={() => setGlobalFilter('')} />
      )}

      {hasAnyActiveFilters &&
        columnFiltersState.map((f) => {
          if (f.value == null || f.value === '') return null

          const values = Array.isArray(f.value) ? f.value : [f.value]

          const column = table.getColumn(f.id)
          let headerLabel: string = f.id
          if (column) {
            const headerDef = column.columnDef.header
            if (typeof headerDef === 'string') headerLabel = headerDef
            else if (typeof headerDef === 'function') {
              try {
                const fakeContext: any = { header: {} as any, table: table, column }
                const rendered = (headerDef as any)(fakeContext) as any
                if (rendered && rendered.props && rendered.props.title) {
                  headerLabel = String(rendered.props.title)
                }
              } catch (e) {
                // ignore
              }
            }
          }

          return values.map((val, idx) => {
            let valueLabel = String(val)
            if (f.id === 'passStatus') {
              try {
                valueLabel = getStatusString(val as any)
              } catch (e) {
                // ignore
              }
            }
            const key = `${f.id}-${idx}-${valueLabel}`

            const onRemove = () => {
              setColumnFiltersFn((prev) => {
                const existing = prev.find((p) => p.id === f.id)
                if (!existing) return prev

                const existingValues = Array.isArray(existing.value)
                  ? existing.value
                  : [existing.value]

                const newValues = existingValues.filter((v) => String(v) !== String(val))

                if (newValues.length === 0) {
                  return prev.filter((p) => p.id !== f.id)
                }

                return prev.map((p) => (p.id === f.id ? { ...p, value: newValues } : p))
              })
            }

            return (
              <FilterBadge key={key} label={`${headerLabel}: ${valueLabel}`} onRemove={onRemove} />
            )
          })
        })}
    </div>
  )
}

export default ActiveFilterBadges
