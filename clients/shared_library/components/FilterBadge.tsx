import { Badge } from '@tumaet/prompt-ui-components'
import { X } from 'lucide-react'

interface FilterBadgeProps {
  label: string
  onRemove: () => void
}

export const FilterBadge = ({ label, onRemove }: FilterBadgeProps) => {
  return (
    <Badge
      variant='secondary'
      className='cursor-pointer flex items-center gap-1'
      onClick={onRemove}
    >
      <X className='h-3 w-3' />
      {label}
    </Badge>
  )
}
