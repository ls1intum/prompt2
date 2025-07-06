import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  ErrorPage,
  Button,
  Checkbox,
} from '@tumaet/prompt-ui-components'
import { AlertCircle, Loader2, Settings } from 'lucide-react'

import { useCoursePhaseConfigStore } from '../../../../zustand/useCoursePhaseConfigStore'

import { useGetAllAssessmentTemplates } from './hooks/useGetAllAssessmentTemplates'
import { useCreateOrUpdateCoursePhaseConfig } from './hooks/useCreateOrUpdateCoursePhaseConfig'
import { AssessmentConfiguration, AssessmentType } from './components/AssessmentConfiguration'

export const CoursePhaseConfigSelection = () => {
  const [error, setError] = useState<string | null>(null)

  const [assessmentTemplateId, setAssessmentTemplateId] = useState<string>('')
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [selfEvaluationEnabled, setSelfEvaluationEnabled] = useState<boolean>(false)
  const [selfEvaluationTemplate, setSelfEvaluationTemplate] = useState<string>('')
  const [selfEvaluationDeadline, setSelfEvaluationDeadline] = useState<Date | undefined>(undefined)
  const [peerAssessmentEnabled, setPeerEvaluationEnabled] = useState<boolean>(false)
  const [peerAssessmentTemplate, setPeerEvaluationTemplate] = useState<string>('')
  const [peerAssessmentDeadline, setPeerEvaluationDeadline] = useState<Date | undefined>(undefined)

  const {
    data: templates,
    isPending: isTemplatesPending,
    isError: isTemplatesError,
  } = useGetAllAssessmentTemplates()

  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()
  const configMutation = useCreateOrUpdateCoursePhaseConfig(setError)

  useEffect(() => {
    if (config) {
      setAssessmentTemplateId(config.assessmentTemplateID || '')
      setDeadline(config.deadline ? new Date(config.deadline) : undefined)
      setSelfEvaluationEnabled(config.selfEvaluationEnabled || false)
      setSelfEvaluationTemplate(config.selfEvaluationTemplate || '')
      setSelfEvaluationDeadline(
        config.selfEvaluationDeadline ? new Date(config.selfEvaluationDeadline) : undefined,
      )
      setPeerEvaluationEnabled(config.peerAssessmentEnabled || false)
      setPeerEvaluationTemplate(config.peerAssessmentTemplate || '')
      setPeerEvaluationDeadline(
        config.peerAssessmentDeadline ? new Date(config.peerAssessmentDeadline) : undefined,
      )
    }
  }, [config])

  if (isTemplatesError) return <ErrorPage />
  if (isTemplatesPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  const handleSaveConfig = () => {
    configMutation.mutate({
      assessmentTemplateId,
      deadline,
      selfEvaluationEnabled,
      selfEvaluationTemplate: selfEvaluationEnabled ? selfEvaluationTemplate : undefined,
      selfEvaluationDeadline: selfEvaluationEnabled ? selfEvaluationDeadline : undefined,
      peerAssessmentEnabled,
      peerAssessmentTemplate: peerAssessmentEnabled ? peerAssessmentTemplate : undefined,
      peerAssessmentDeadline: peerAssessmentEnabled ? peerAssessmentDeadline : undefined,
    })
  }

  const hasChanges =
    assessmentTemplateId !== (config?.assessmentTemplateID || '') ||
    deadline?.getTime() !== (config?.deadline ? new Date(config.deadline).getTime() : undefined) ||
    selfEvaluationEnabled !== (config?.selfEvaluationEnabled || false) ||
    selfEvaluationTemplate !== (config?.selfEvaluationTemplate || '') ||
    selfEvaluationDeadline?.getTime() !==
      (config?.selfEvaluationDeadline
        ? new Date(config.selfEvaluationDeadline).getTime()
        : undefined) ||
    peerAssessmentEnabled !== (config?.peerAssessmentEnabled || false) ||
    peerAssessmentTemplate !== (config?.peerAssessmentTemplate || '') ||
    peerAssessmentDeadline?.getTime() !==
      (config?.peerAssessmentDeadline
        ? new Date(config.peerAssessmentDeadline).getTime()
        : undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='h-5 w-5' />
          Assessment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 space-y-4'>
          {error && (
            <div className='flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm'>{error}</span>
            </div>
          )}

          <AssessmentConfiguration
            type={AssessmentType.ASSESSMENT}
            assessmentTemplateId={assessmentTemplateId}
            setAssessmentTemplateId={setAssessmentTemplateId}
            deadline={deadline}
            setDeadline={setDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
          />

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='self-assessment-enabled'
                checked={selfEvaluationEnabled}
                onCheckedChange={(checked) => setSelfEvaluationEnabled(checked as boolean)}
                disabled={configMutation.isPending}
              />
              <Label htmlFor='self-assessment-enabled' className='text-sm font-medium'>
                Enable Self Evaluation
              </Label>
            </div>

            {selfEvaluationEnabled && (
              <AssessmentConfiguration
                type={AssessmentType.SELF}
                assessmentTemplateId={selfEvaluationTemplate}
                setAssessmentTemplateId={setSelfEvaluationTemplate}
                deadline={selfEvaluationDeadline}
                setDeadline={setSelfEvaluationDeadline}
                templates={templates ?? []}
                configMutation={configMutation}
                setError={setError}
              />
            )}
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='peer-assessment-enabled'
                checked={peerAssessmentEnabled}
                onCheckedChange={(checked) => setPeerEvaluationEnabled(checked as boolean)}
                disabled={configMutation.isPending}
              />
              <Label htmlFor='peer-assessment-enabled' className='text-sm font-medium'>
                Enable Peer Evaluation
              </Label>
            </div>

            {peerAssessmentEnabled && (
              <AssessmentConfiguration
                type={AssessmentType.PEER}
                assessmentTemplateId={peerAssessmentTemplate}
                setAssessmentTemplateId={setPeerEvaluationTemplate}
                deadline={peerAssessmentDeadline}
                setDeadline={setPeerEvaluationDeadline}
                templates={templates ?? []}
                configMutation={configMutation}
                setError={setError}
              />
            )}
          </div>

          <div className='flex justify-end pt-4'>
            <Button
              onClick={handleSaveConfig}
              disabled={!hasChanges || configMutation.isPending || !assessmentTemplateId}
              className='min-w-[120px]'
            >
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
            <div className='text-green-600 text-sm text-center'>
              Configuration saved successfully!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
