import { X } from 'lucide-react'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tumaet/prompt-ui-components'

import { Competency } from '../../../../../../../interfaces/competency'

interface EvaluationMappingProps {
  label: string
  placeholder: string
  competencies: Competency[]
  currentMapping: string | undefined
  onMappingChange: (competencyId: string) => void
  onRemoveMapping: () => void
}

export const EvaluationMapping = ({
  label,
  placeholder,
  competencies,
  currentMapping,
  onMappingChange,
  onRemoveMapping,
}: EvaluationMappingProps) => {
  return (
    <div>
      <label className='text-xs font-medium text-muted-foreground block mb-1'>{label}:</label>
      <div className='flex items-center gap-2'>
        <Select value={currentMapping || 'none'} onValueChange={onMappingChange}>
          <SelectTrigger className='flex-1 text-xs'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>
              <span className='text-xs text-muted-foreground'>No mapping</span>
            </SelectItem>
            {competencies.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                <span className='text-xs'>{comp.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentMapping && (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-destructive/20'
            onClick={onRemoveMapping}
            aria-label={`Remove ${label.toLowerCase()} mapping`}
          >
            <X className='h-3 w-3' />
          </Button>
        )}
      </div>
    </div>
  )
}
