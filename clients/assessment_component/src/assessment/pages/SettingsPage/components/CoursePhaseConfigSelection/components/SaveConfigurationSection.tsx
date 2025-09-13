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
  const handleSaveConfig = () => {
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
    })
  }

  const isDisabled =
    !hasChanges || configMutation.isPending || !mainConfigState.assessmentTemplateId || disabled

  return (
    <>
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
