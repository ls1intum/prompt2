import { Checkbox, Label } from '@tumaet/prompt-ui-components'

interface StudentVisibilityTogglesProps {
  gradeSuggestionVisible: boolean
  onGradeSuggestionVisibleChange: (checked: boolean) => void
  actionItemsVisible: boolean
  onActionItemsVisibleChange: (checked: boolean) => void
  gradingSheetVisible: boolean
  onGradingSheetVisibleChange: (checked: boolean) => void
  disabled?: boolean
}

export const StudentVisibilityToggles = ({
  gradeSuggestionVisible,
  onGradeSuggestionVisibleChange,
  actionItemsVisible,
  onActionItemsVisibleChange,
  gradingSheetVisible,
  onGradingSheetVisibleChange,
  disabled = false,
}: StudentVisibilityTogglesProps) => {
  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
        Student Visibility Settings
      </h3>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='grading-sheet-visible'
          checked={gradingSheetVisible}
          onCheckedChange={(value) => {
            const checked = value === true
            onGradingSheetVisibleChange(checked)
          }}
          disabled={disabled}
        />
        <Label htmlFor='grading-sheet-visible' className='text-sm font-medium'>
          Show Assessment sheet (including Score Levels, Examples, and Comments)
        </Label>
      </div>
      <div className='space-y-3 pl-1'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='grade-suggestion-visible'
            checked={gradeSuggestionVisible}
            onCheckedChange={(value) => {
              const checked = value === true
              onGradeSuggestionVisibleChange(checked)
            }}
            disabled={disabled}
          />
          <Label htmlFor='grade-suggestion-visible' className='text-sm font-medium'>
            Show grade suggestions and final comment
          </Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='action-items-visible'
            checked={actionItemsVisible}
            onCheckedChange={(value) => {
              const checked = value === true
              onActionItemsVisibleChange(checked)
            }}
            disabled={disabled}
          />
          <Label htmlFor='action-items-visible' className='text-sm font-medium'>
            Show action items
          </Label>
        </div>
      </div>
    </div>
  )
}
