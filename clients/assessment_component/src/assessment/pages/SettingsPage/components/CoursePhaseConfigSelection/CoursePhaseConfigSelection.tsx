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

import { AssessmentType } from '../../../../interfaces/assessmentType'

import { useCoursePhaseConfigStore } from '../../../../zustand/useCoursePhaseConfigStore'

import { useGetAllAssessmentTemplates } from './hooks/useGetAllAssessmentTemplates'
import { useCreateOrUpdateCoursePhaseConfig } from './hooks/useCreateOrUpdateCoursePhaseConfig'
import { AssessmentConfiguration } from './components/AssessmentConfiguration'

export const CoursePhaseConfigSelection = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  const [assessmentTemplateId, setAssessmentTemplateId] = useState<string>('')
  const [start, setStart] = useState<Date | undefined>(undefined)
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [selfEvaluationEnabled, setSelfEvaluationEnabled] = useState<boolean>(false)
  const [selfEvaluationTemplate, setSelfEvaluationTemplate] = useState<string>('')
  const [selfEvaluationStart, setSelfEvaluationStart] = useState<Date | undefined>(undefined)
  const [selfEvaluationDeadline, setSelfEvaluationDeadline] = useState<Date | undefined>(undefined)
  const [peerEvaluationEnabled, setPeerEvaluationEnabled] = useState<boolean>(false)
  const [peerEvaluationTemplate, setPeerEvaluationTemplate] = useState<string>('')
  const [peerEvaluationStart, setPeerEvaluationStart] = useState<Date | undefined>(undefined)
  const [peerEvaluationDeadline, setPeerEvaluationDeadline] = useState<Date | undefined>(undefined)
  const [tutorEvaluationEnabled, setTutorEvaluationEnabled] = useState<boolean>(false)
  const [tutorEvaluationTemplate, setTutorEvaluationTemplate] = useState<string>('')
  const [tutorEvaluationStart, setTutorEvaluationStart] = useState<Date | undefined>(undefined)
  const [tutorEvaluationDeadline, setTutorEvaluationDeadline] = useState<Date | undefined>(
    undefined,
  )
  const [evaluationResultsVisible, setEvaluationResultsVisible] = useState<boolean>(false)

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
      setStart(config.start ? new Date(config.start) : undefined)
      setDeadline(config.deadline ? new Date(config.deadline) : undefined)
      setSelfEvaluationEnabled(config.selfEvaluationEnabled || false)
      setSelfEvaluationTemplate(config.selfEvaluationTemplate || '')
      setSelfEvaluationStart(
        config.selfEvaluationStart ? new Date(config.selfEvaluationStart) : undefined,
      )
      setSelfEvaluationDeadline(
        config.selfEvaluationDeadline ? new Date(config.selfEvaluationDeadline) : undefined,
      )
      setPeerEvaluationEnabled(config.peerEvaluationEnabled || false)
      setPeerEvaluationTemplate(config.peerEvaluationTemplate || '')
      setPeerEvaluationStart(
        config.peerEvaluationStart ? new Date(config.peerEvaluationStart) : undefined,
      )
      setPeerEvaluationDeadline(
        config.peerEvaluationDeadline ? new Date(config.peerEvaluationDeadline) : undefined,
      )
      setTutorEvaluationEnabled(config.tutorEvaluationEnabled || false)
      setTutorEvaluationTemplate(config.tutorEvaluationTemplate || '')
      setTutorEvaluationStart(
        config.tutorEvaluationStart ? new Date(config.tutorEvaluationStart) : undefined,
      )
      setTutorEvaluationDeadline(
        config.tutorEvaluationDeadline ? new Date(config.tutorEvaluationDeadline) : undefined,
      )
      setEvaluationResultsVisible(config.evaluationResultsVisible || false)
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
      start,
      deadline,
      selfEvaluationEnabled,
      selfEvaluationTemplate: selfEvaluationTemplate,
      selfEvaluationStart: selfEvaluationStart,
      selfEvaluationDeadline: selfEvaluationDeadline,
      peerEvaluationEnabled,
      peerEvaluationTemplate: peerEvaluationTemplate,
      peerEvaluationStart: peerEvaluationStart,
      peerEvaluationDeadline: peerEvaluationDeadline,
      tutorEvaluationEnabled,
      tutorEvaluationTemplate: tutorEvaluationTemplate,
      tutorEvaluationStart: tutorEvaluationStart,
      tutorEvaluationDeadline: tutorEvaluationDeadline,
      evaluationResultsVisible,
    })
  }

  const hasChanges =
    assessmentTemplateId !== (config?.assessmentTemplateID || '') ||
    start?.getTime() !== (config?.start ? new Date(config.start).getTime() : undefined) ||
    deadline?.getTime() !== (config?.deadline ? new Date(config.deadline).getTime() : undefined) ||
    selfEvaluationEnabled !== (config?.selfEvaluationEnabled || false) ||
    selfEvaluationTemplate !== (config?.selfEvaluationTemplate || '') ||
    selfEvaluationStart?.getTime() !==
      (config?.selfEvaluationStart ? new Date(config.selfEvaluationStart).getTime() : undefined) ||
    selfEvaluationDeadline?.getTime() !==
      (config?.selfEvaluationDeadline
        ? new Date(config.selfEvaluationDeadline).getTime()
        : undefined) ||
    peerEvaluationEnabled !== (config?.peerEvaluationEnabled || false) ||
    peerEvaluationTemplate !== (config?.peerEvaluationTemplate || '') ||
    peerEvaluationStart?.getTime() !==
      (config?.peerEvaluationStart ? new Date(config.peerEvaluationStart).getTime() : undefined) ||
    peerEvaluationDeadline?.getTime() !==
      (config?.peerEvaluationDeadline
        ? new Date(config.peerEvaluationDeadline).getTime()
        : undefined) ||
    tutorEvaluationEnabled !== (config?.tutorEvaluationEnabled || false) ||
    tutorEvaluationTemplate !== (config?.tutorEvaluationTemplate || '') ||
    tutorEvaluationStart?.getTime() !==
      (config?.tutorEvaluationStart
        ? new Date(config.tutorEvaluationStart).getTime()
        : undefined) ||
    tutorEvaluationDeadline?.getTime() !==
      (config?.tutorEvaluationDeadline
        ? new Date(config.tutorEvaluationDeadline).getTime()
        : undefined) ||
    evaluationResultsVisible !== (config?.evaluationResultsVisible || false)

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
            startDate={start}
            setStartDate={setStart}
            deadline={deadline}
            setDeadline={setDeadline}
            templates={templates ?? []}
            configMutation={configMutation}
            setError={setError}
          />

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='evaluation-results-visible'
                checked={evaluationResultsVisible}
                onCheckedChange={(checked) => setEvaluationResultsVisible(checked as boolean)}
                disabled={configMutation.isPending}
              />
              <Label htmlFor='evaluation-results-visible' className='text-sm font-medium'>
                Make evaluation results visible to assessment authors before they submit their
                assessment
              </Label>
            </div>
          </div>

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
                startDate={selfEvaluationStart}
                setStartDate={setSelfEvaluationStart}
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
                checked={peerEvaluationEnabled}
                onCheckedChange={(checked) => setPeerEvaluationEnabled(checked as boolean)}
                disabled={configMutation.isPending}
              />
              <Label htmlFor='peer-assessment-enabled' className='text-sm font-medium'>
                Enable Peer Evaluation
              </Label>
            </div>

            {peerEvaluationEnabled && (
              <AssessmentConfiguration
                type={AssessmentType.PEER}
                assessmentTemplateId={peerEvaluationTemplate}
                setAssessmentTemplateId={setPeerEvaluationTemplate}
                startDate={peerEvaluationStart}
                setStartDate={setPeerEvaluationStart}
                deadline={peerEvaluationDeadline}
                setDeadline={setPeerEvaluationDeadline}
                templates={templates ?? []}
                configMutation={configMutation}
                setError={setError}
              />
            )}
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='tutor-assessment-enabled'
                checked={tutorEvaluationEnabled}
                onCheckedChange={(checked) => setTutorEvaluationEnabled(checked as boolean)}
                disabled={configMutation.isPending}
              />
              <Label htmlFor='tutor-assessment-enabled' className='text-sm font-medium'>
                Enable Tutor Evaluation
              </Label>
            </div>

            {tutorEvaluationEnabled && (
              <AssessmentConfiguration
                type={AssessmentType.TUTOR}
                assessmentTemplateId={tutorEvaluationTemplate}
                setAssessmentTemplateId={setTutorEvaluationTemplate}
                startDate={tutorEvaluationStart}
                setStartDate={setTutorEvaluationStart}
                deadline={tutorEvaluationDeadline}
                setDeadline={setTutorEvaluationDeadline}
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
