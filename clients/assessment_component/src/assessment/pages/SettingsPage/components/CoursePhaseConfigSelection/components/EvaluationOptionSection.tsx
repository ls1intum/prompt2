import { Checkbox, Label } from '@tumaet/prompt-ui-components'
import { AssessmentType } from '../../../../../interfaces/assessmentType'
import { AssessmentTemplate } from '../../../../../interfaces/assessmentTemplate'
import { AssessmentConfiguration } from './AssessmentConfiguration'

interface EvaluationOptionSectionProps {
  type: AssessmentType
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  templateId: string
  onTemplateIdChange: (templateId: string) => void
  startDate?: Date
  onStartDateChange: (date: Date | undefined) => void
  deadline?: Date
  onDeadlineChange: (date: Date | undefined) => void
  templates: AssessmentTemplate[]
  configMutation: any
  setError: (error: string | undefined) => void
  disabled?: boolean
}

const getEvaluationTypeLabel = (type: AssessmentType): string => {
  switch (type) {
    case AssessmentType.SELF:
      return 'Enable Self Evaluation'
    case AssessmentType.PEER:
      return 'Enable Peer Evaluation'
    case AssessmentType.TUTOR:
      return 'Enable Tutor Evaluation'
    default:
      return 'Enable Evaluation'
  }
}

const getEvaluationTypeId = (type: AssessmentType): string => {
  switch (type) {
    case AssessmentType.SELF:
      return 'self-assessment-enabled'
    case AssessmentType.PEER:
      return 'peer-assessment-enabled'
    case AssessmentType.TUTOR:
      return 'tutor-assessment-enabled'
    default:
      return 'assessment-enabled'
  }
}

export const EvaluationOptionSection = ({
  type,
  enabled,
  onEnabledChange,
  templateId,
  onTemplateIdChange,
  startDate,
  onStartDateChange,
  deadline,
  onDeadlineChange,
  templates,
  configMutation,
  setError,
  disabled = false,
}: EvaluationOptionSectionProps) => {
  const checkboxId = getEvaluationTypeId(type)
  const label = getEvaluationTypeLabel(type)

  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id={checkboxId}
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked as boolean)}
          disabled={disabled}
        />
        <Label htmlFor={checkboxId} className='text-sm font-medium'>
          {label}
        </Label>
      </div>

      {enabled && (
        <AssessmentConfiguration
          type={type}
          assessmentTemplateId={templateId}
          setAssessmentTemplateId={onTemplateIdChange}
          startDate={startDate}
          setStartDate={onStartDateChange}
          deadline={deadline}
          setDeadline={onDeadlineChange}
          templates={templates}
          configMutation={configMutation}
          setError={setError}
        />
      )}
    </div>
  )
}
