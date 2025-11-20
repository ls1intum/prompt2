import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, ErrorPage } from '@tumaet/prompt-ui-components'
import { Loader2, Settings } from 'lucide-react'

import { AssessmentType } from '../../../../interfaces/assessmentType'

import { useCoursePhaseConfigStore } from '../../../../zustand/useCoursePhaseConfigStore'
import { useGetAllAssessmentSchemas } from './hooks/useGetAllAssessmentSchemas'
import { useCreateOrUpdateCoursePhaseConfig } from './hooks/useCreateOrUpdateCoursePhaseConfig'
import { useCoursePhaseConfigForm } from './hooks/useCoursePhaseConfigForm'
import { useEvaluationOptions } from './hooks/useEvaluationOptions'

import { AssessmentConfiguration } from './components/AssessmentConfiguration'
import { ErrorDisplay } from './components/ErrorDisplay'
import { EvaluationVisibilityToggle } from './components/EvaluationVisibilityToggle'
import { StudentVisibilityToggles } from './components/StudentVisibilityToggles'
import { EvaluationOptionSection } from './components/EvaluationOptionSection'
import { SaveConfigurationSection } from './components/SaveConfigurationSection'

export const CoursePhaseConfigSelection = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  const { coursePhaseConfig: originalConfig } = useCoursePhaseConfigStore()

  const {
    assessmentSchemaId,
    setAssessmentSchemaId,
    start,
    setStart,
    deadline,
    setDeadline,
    evaluationResultsVisible,
    setEvaluationResultsVisible,
    gradeSuggestionVisible,
    setGradeSuggestionVisible,
    actionItemsVisible,
    setActionItemsVisible,
    mainConfigState,
    hasMainConfigChanges,
  } = useCoursePhaseConfigForm()

  const {
    selfEvaluationEnabled,
    setSelfEvaluationEnabled,
    selfEvaluationSchema,
    setSelfEvaluationSchema,
    selfEvaluationStart,
    setSelfEvaluationStart,
    selfEvaluationDeadline,
    setSelfEvaluationDeadline,
    peerEvaluationEnabled,
    setPeerEvaluationEnabled,
    peerEvaluationSchema,
    setPeerEvaluationSchema,
    peerEvaluationStart,
    setPeerEvaluationStart,
    peerEvaluationDeadline,
    setPeerEvaluationDeadline,
    tutorEvaluationEnabled,
    setTutorEvaluationEnabled,
    tutorEvaluationSchema,
    setTutorEvaluationSchema,
    tutorEvaluationStart,
    setTutorEvaluationStart,
    tutorEvaluationDeadline,
    setTutorEvaluationDeadline,
    evaluationOptions,
    hasEvaluationChanges,
  } = useEvaluationOptions()

  const {
    data: schemas,
    isPending: isSchemasPending,
    isError: isSchemasError,
  } = useGetAllAssessmentSchemas()

  const configMutation = useCreateOrUpdateCoursePhaseConfig(setError)

  if (isSchemasError) return <ErrorPage />
  if (isSchemasPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  const hasChanges =
    originalConfig === undefined ||
    hasMainConfigChanges(originalConfig) ||
    hasEvaluationChanges(originalConfig)
  const handleSaveConfig = (configRequest: Parameters<typeof configMutation.mutate>[0]) => {
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
            assessmentSchemaId={assessmentSchemaId}
            setAssessmentSchemaId={setAssessmentSchemaId}
            startDate={start}
            setStartDate={setStart}
            deadline={deadline}
            setDeadline={setDeadline}
            schemas={schemas ?? []}
            configMutation={configMutation}
            setError={setError}
          />

          <EvaluationVisibilityToggle
            checked={evaluationResultsVisible}
            onCheckedChange={setEvaluationResultsVisible}
            disabled={configMutation.isPending}
          />

          <StudentVisibilityToggles
            gradeSuggestionVisible={gradeSuggestionVisible}
            onGradeSuggestionVisibleChange={setGradeSuggestionVisible}
            actionItemsVisible={actionItemsVisible}
            onActionItemsVisibleChange={setActionItemsVisible}
            disabled={configMutation.isPending}
          />

          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Evaluation Settings
            </h3>
          </div>

          <EvaluationOptionSection
            type={AssessmentType.SELF}
            enabled={selfEvaluationEnabled}
            onEnabledChange={setSelfEvaluationEnabled}
            schemaId={selfEvaluationSchema}
            onSchemaIdChange={setSelfEvaluationSchema}
            startDate={selfEvaluationStart}
            onStartDateChange={setSelfEvaluationStart}
            deadline={selfEvaluationDeadline}
            onDeadlineChange={setSelfEvaluationDeadline}
            schemas={schemas ?? []}
            configMutation={configMutation}
            setError={setError}
            disabled={configMutation.isPending}
          />

          <EvaluationOptionSection
            type={AssessmentType.PEER}
            enabled={peerEvaluationEnabled}
            onEnabledChange={setPeerEvaluationEnabled}
            schemaId={peerEvaluationSchema}
            onSchemaIdChange={setPeerEvaluationSchema}
            startDate={peerEvaluationStart}
            onStartDateChange={setPeerEvaluationStart}
            deadline={peerEvaluationDeadline}
            onDeadlineChange={setPeerEvaluationDeadline}
            schemas={schemas ?? []}
            configMutation={configMutation}
            setError={setError}
            disabled={configMutation.isPending}
          />

          <EvaluationOptionSection
            type={AssessmentType.TUTOR}
            enabled={tutorEvaluationEnabled}
            onEnabledChange={setTutorEvaluationEnabled}
            schemaId={tutorEvaluationSchema}
            onSchemaIdChange={setTutorEvaluationSchema}
            startDate={tutorEvaluationStart}
            onStartDateChange={setTutorEvaluationStart}
            deadline={tutorEvaluationDeadline}
            onDeadlineChange={setTutorEvaluationDeadline}
            schemas={schemas ?? []}
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
