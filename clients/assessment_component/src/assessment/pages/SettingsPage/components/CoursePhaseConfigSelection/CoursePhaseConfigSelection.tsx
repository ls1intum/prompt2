import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, ErrorPage } from '@tumaet/prompt-ui-components'
import { Loader2, Settings } from 'lucide-react'

import { AssessmentType } from '../../../../interfaces/assessmentType'

import { useCoursePhaseConfigStore } from '../../../../zustand/useCoursePhaseConfigStore'
import { useGetAllAssessmentTemplates } from './hooks/useGetAllAssessmentTemplates'
import { useCreateOrUpdateCoursePhaseConfig } from './hooks/useCreateOrUpdateCoursePhaseConfig'
import { useCoursePhaseConfigForm } from './hooks/useCoursePhaseConfigForm'
import { useEvaluationOptions } from './hooks/useEvaluationOptions'

import { AssessmentConfiguration } from './components/AssessmentConfiguration'
import { ErrorDisplay } from './components/ErrorDisplay'
import { EvaluationVisibilityToggle } from './components/EvaluationVisibilityToggle'
import { EvaluationOptionSection } from './components/EvaluationOptionSection'
import { SaveConfigurationSection } from './components/SaveConfigurationSection'

export const CoursePhaseConfigSelection = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  const { coursePhaseConfig: originalConfig } = useCoursePhaseConfigStore()

  const {
    assessmentTemplateId,
    setAssessmentTemplateId,
    start,
    setStart,
    deadline,
    setDeadline,
    evaluationResultsVisible,
    setEvaluationResultsVisible,
    mainConfigState,
    hasMainConfigChanges,
  } = useCoursePhaseConfigForm()

  const {
    selfEvaluationEnabled,
    setSelfEvaluationEnabled,
    selfEvaluationTemplate,
    setSelfEvaluationTemplate,
    selfEvaluationStart,
    setSelfEvaluationStart,
    selfEvaluationDeadline,
    setSelfEvaluationDeadline,
    peerEvaluationEnabled,
    setPeerEvaluationEnabled,
    peerEvaluationTemplate,
    setPeerEvaluationTemplate,
    peerEvaluationStart,
    setPeerEvaluationStart,
    peerEvaluationDeadline,
    setPeerEvaluationDeadline,
    tutorEvaluationEnabled,
    setTutorEvaluationEnabled,
    tutorEvaluationTemplate,
    setTutorEvaluationTemplate,
    tutorEvaluationStart,
    setTutorEvaluationStart,
    tutorEvaluationDeadline,
    setTutorEvaluationDeadline,
    evaluationOptions,
    hasEvaluationChanges,
  } = useEvaluationOptions()

  const {
    data: templates,
    isPending: isTemplatesPending,
    isError: isTemplatesError,
  } = useGetAllAssessmentTemplates()

  const configMutation = useCreateOrUpdateCoursePhaseConfig(setError)

  if (isTemplatesError) return <ErrorPage />
  if (isTemplatesPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  const hasChanges = hasMainConfigChanges(originalConfig) || hasEvaluationChanges(originalConfig)
  const handleSaveConfig = (configRequest: any) => {
    configMutation.mutate(configRequest)
  }

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
          <ErrorDisplay error={error} />

          <AssessmentConfiguration
            type={AssessmentType.ASSESSMENT}
            assessmentTemplateId={assessmentTemplateId}
            setAssessmentTemplateId={setAssessmentTemplateId}
            startDate={start}
            setStartDate={setStart}
            deadline={deadline}
            setDeadline={setDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
          />

          <EvaluationVisibilityToggle
            checked={evaluationResultsVisible}
            onCheckedChange={setEvaluationResultsVisible}
            disabled={configMutation.isPending}
          />

          <EvaluationOptionSection
            type={AssessmentType.SELF}
            enabled={selfEvaluationEnabled}
            onEnabledChange={setSelfEvaluationEnabled}
            templateId={selfEvaluationTemplate}
            onTemplateIdChange={setSelfEvaluationTemplate}
            startDate={selfEvaluationStart}
            onStartDateChange={setSelfEvaluationStart}
            deadline={selfEvaluationDeadline}
            onDeadlineChange={setSelfEvaluationDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
            disabled={configMutation.isPending}
          />

          <EvaluationOptionSection
            type={AssessmentType.PEER}
            enabled={peerEvaluationEnabled}
            onEnabledChange={setPeerEvaluationEnabled}
            templateId={peerEvaluationTemplate}
            onTemplateIdChange={setPeerEvaluationTemplate}
            startDate={peerEvaluationStart}
            onStartDateChange={setPeerEvaluationStart}
            deadline={peerEvaluationDeadline}
            onDeadlineChange={setPeerEvaluationDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
            disabled={configMutation.isPending}
          />

          <EvaluationOptionSection
            type={AssessmentType.TUTOR}
            enabled={tutorEvaluationEnabled}
            onEnabledChange={setTutorEvaluationEnabled}
            templateId={tutorEvaluationTemplate}
            onTemplateIdChange={setTutorEvaluationTemplate}
            startDate={tutorEvaluationStart}
            onStartDateChange={setTutorEvaluationStart}
            deadline={tutorEvaluationDeadline}
            onDeadlineChange={setTutorEvaluationDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
            disabled={configMutation.isPending}
          />

          <SaveConfigurationSection
            mainConfigState={mainConfigState}
            evaluationOptions={evaluationOptions}
            hasChanges={hasChanges}
            configMutation={configMutation}
            onSave={handleSaveConfig}
            disabled={configMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}
