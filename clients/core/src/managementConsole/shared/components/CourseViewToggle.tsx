import { Button } from '@tumaet/prompt-ui-components'
import { Copy, TableProperties } from 'lucide-react'

export type CourseViewMode = 'cards' | 'table'

interface CourseViewToggleProps {
  viewMode: CourseViewMode
  onChange: (mode: CourseViewMode) => void
}

export const CourseViewToggle = ({ viewMode, onChange }: CourseViewToggleProps) => {
  return (
    <div className='inline-flex rounded-md border p-1 bg-muted/40'>
      <Button
        variant={viewMode === 'cards' ? 'default' : 'ghost'}
        onClick={() => onChange('cards')}
        size='sm'
      >
        <Copy />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        onClick={() => onChange('table')}
        size='sm'
      >
        <TableProperties />
      </Button>
    </div>
  )
}
