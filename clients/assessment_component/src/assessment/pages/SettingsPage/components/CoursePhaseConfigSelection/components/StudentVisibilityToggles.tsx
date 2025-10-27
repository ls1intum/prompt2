import { Checkbox, Label } from '@tumaet/prompt-ui-components'

interface StudentVisibilityTogglesProps {
  gradeSuggestionVisible: boolean
  onGradeSuggestionVisibleChange: (checked: boolean) => void
  actionItemsVisible: boolean
  onActionItemsVisibleChange: (checked: boolean) => void
  disabled?: boolean
}

export const StudentVisibilityToggles = ({
  gradeSuggestionVisible,
  onGradeSuggestionVisibleChange,
  actionItemsVisible,
  onActionItemsVisibleChange,
  disabled = false,
}: StudentVisibilityTogglesProps) => {
  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
        Student Visibility Settings
      </h3>
      <div className='space-y-3 pl-1'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='grade-suggestion-visible'
            checked={gradeSuggestionVisible}
            onCheckedChange={(value) => onGradeSuggestionVisibleChange(value as boolean)}
            disabled={disabled}
          />
          <Label htmlFor='grade-suggestion-visible' className='text-sm font-medium'>
            Show grade suggestions to students after the assessment deadline
          </Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='action-items-visible'
            checked={actionItemsVisible}
            onCheckedChange={(value) => onActionItemsVisibleChange(value as boolean)}
            disabled={disabled}
          />
          <Label htmlFor='action-items-visible' className='text-sm font-medium'>
            Show action items to students after the assessment deadline
          </Label>
        </div>
      </div>
    </div>
  )
}
