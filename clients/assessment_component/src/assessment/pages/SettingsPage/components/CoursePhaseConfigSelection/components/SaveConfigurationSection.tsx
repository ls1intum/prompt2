import { useState, useEffect, useCallback } from 'react'
import { Button } from '@tumaet/prompt-ui-components'
import { Loader2 } from 'lucide-react'
import { CreateOrUpdateCoursePhaseConfigRequest } from '../../../../../interfaces/coursePhaseConfig'
import { MainConfigState } from '../hooks/useCoursePhaseConfigForm'
import { EvaluationOptions } from '../interfaces/EvaluationOption'

interface SaveConfigurationSectionProps {
  mainConfigState: MainConfigState
  evaluationOptions: EvaluationOptions
  hasChanges: boolean
  configMutation: any
  onSave: (config: CreateOrUpdateCoursePhaseConfigRequest) => void
  disabled?: boolean
}

export const SaveConfigurationSection = ({
  mainConfigState,
  evaluationOptions,
  hasChanges,
  configMutation,
  onSave,
  disabled = false,
}: SaveConfigurationSectionProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateConfiguration = useCallback((): boolean => {
    const errors: string[] = []

    // Validate main config dates
    if (mainConfigState.start && mainConfigState.deadline) {
      if (mainConfigState.start > mainConfigState.deadline) {
        errors.push('Main configuration start date must be before deadline')
      }
    }

    // Validate enabled evaluations have templates
    if (evaluationOptions.self.enabled && !evaluationOptions.self.template) {
      errors.push('Self-evaluation template is required when self-evaluation is enabled')
    }
    if (evaluationOptions.peer.enabled && !evaluationOptions.peer.template) {
      errors.push('Peer-evaluation template is required when peer-evaluation is enabled')
    }
    if (evaluationOptions.tutor.enabled && !evaluationOptions.tutor.template) {
      errors.push('Tutor-evaluation template is required when tutor-evaluation is enabled')
    }

    // Validate evaluation start/deadline relationships
    if (
      evaluationOptions.self.enabled &&
      evaluationOptions.self.start &&
      evaluationOptions.self.deadline
    ) {
      if (evaluationOptions.self.start > evaluationOptions.self.deadline) {
        errors.push('Self-evaluation start date must be before deadline')
      }
    }
    if (
      evaluationOptions.peer.enabled &&
      evaluationOptions.peer.start &&
      evaluationOptions.peer.deadline
    ) {
      if (evaluationOptions.peer.start > evaluationOptions.peer.deadline) {
        errors.push('Peer-evaluation start date must be before deadline')
      }
    }
    if (
      evaluationOptions.tutor.enabled &&
      evaluationOptions.tutor.start &&
      evaluationOptions.tutor.deadline
    ) {
      if (evaluationOptions.tutor.start > evaluationOptions.tutor.deadline) {
        errors.push('Tutor-evaluation start date must be before deadline')
      }
    }

    setValidationErrors(errors)
    return errors.length === 0
  }, [mainConfigState, evaluationOptions])

  // Re-validate whenever configuration changes
  useEffect(() => {
    validateConfiguration()
  }, [validateConfiguration])

  const handleSaveConfig = () => {
    // Run validation before save
    if (!validateConfiguration()) {
      return // Short-circuit if validation fails
    }
    onSave({
      assessmentTemplateId: mainConfigState.assessmentTemplateId,
      start: mainConfigState.start,
      deadline: mainConfigState.deadline,
      selfEvaluationEnabled: evaluationOptions.self.enabled,
      selfEvaluationTemplate: evaluationOptions.self.template,
      selfEvaluationStart: evaluationOptions.self.start,
      selfEvaluationDeadline: evaluationOptions.self.deadline,
      peerEvaluationEnabled: evaluationOptions.peer.enabled,
      peerEvaluationTemplate: evaluationOptions.peer.template,
      peerEvaluationStart: evaluationOptions.peer.start,
      peerEvaluationDeadline: evaluationOptions.peer.deadline,
      tutorEvaluationEnabled: evaluationOptions.tutor.enabled,
      tutorEvaluationTemplate: evaluationOptions.tutor.template,
      tutorEvaluationStart: evaluationOptions.tutor.start,
      tutorEvaluationDeadline: evaluationOptions.tutor.deadline,
      evaluationResultsVisible: mainConfigState.evaluationResultsVisible,
      gradeSuggestionVisible: mainConfigState.gradeSuggestionVisible,
      actionItemsVisible: mainConfigState.actionItemsVisible,
    })
  }

  const isDisabled =
    !hasChanges ||
    configMutation.isPending ||
    !mainConfigState.assessmentTemplateId ||
    disabled ||
    validationErrors.length > 0

  return (
    <>
      {validationErrors.length > 0 && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <h4 className='text-red-800 font-medium mb-2'>Please fix the following issues:</h4>
          <ul className='text-red-700 text-sm space-y-1'>
            {validationErrors.map((error, index) => (
              <li key={index} className='list-disc ml-4'>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className='flex justify-end pt-4'>
        <Button onClick={handleSaveConfig} disabled={isDisabled} className='min-w-[120px]'>
          {configMutation.isPending ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>

      {configMutation.isSuccess && !hasChanges && (
        <div className='text-green-600 text-sm text-center'>Configuration saved successfully!</div>
      )}
    </>
  )
}
