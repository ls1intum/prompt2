import { Checkbox, Label } from '@tumaet/prompt-ui-components'

interface EvaluationVisibilityToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export const EvaluationVisibilityToggle = ({
  checked,
  onCheckedChange,
  disabled = false,
}: EvaluationVisibilityToggleProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='evaluation-results-visible'
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value as boolean)}
          disabled={disabled}
        />
        <Label htmlFor='evaluation-results-visible' className='text-sm font-medium'>
          Make evaluation results visible to assessment authors before they submit their assessment
        </Label>
      </div>
    </div>
  )
}
