import { useState, useEffect } from 'react'
import { useCoursePhaseConfigStore } from '../../../../../zustand/useCoursePhaseConfigStore'
import { CoursePhaseConfig } from '../../../../../interfaces/coursePhaseConfig'

export interface MainConfigState {
  assessmentTemplateId: string
  start?: Date
  deadline?: Date
  evaluationResultsVisible: boolean
  gradeSuggestionVisible: boolean
  actionItemsVisible: boolean
}

export const useCoursePhaseConfigForm = () => {
  const [assessmentTemplateId, setAssessmentTemplateId] = useState<string>('')
  const [start, setStart] = useState<Date | undefined>(undefined)
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [evaluationResultsVisible, setEvaluationResultsVisible] = useState<boolean>(false)
  const [gradeSuggestionVisible, setGradeSuggestionVisible] = useState<boolean>(true)
  const [actionItemsVisible, setActionItemsVisible] = useState<boolean>(true)

  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()

  useEffect(() => {
    if (config) {
      setAssessmentTemplateId(config.assessmentTemplateID || '')
      setStart(config.start ? new Date(config.start) : undefined)
      setDeadline(config.deadline ? new Date(config.deadline) : undefined)
      setEvaluationResultsVisible(config.evaluationResultsVisible || false)
      setGradeSuggestionVisible(config.gradeSuggestionVisible ?? true)
      setActionItemsVisible(config.actionItemsVisible ?? true)
    }
  }, [config])

  const mainConfigState: MainConfigState = {
    assessmentTemplateId,
    start,
    deadline,
    evaluationResultsVisible,
    gradeSuggestionVisible,
    actionItemsVisible,
  }

  const hasMainConfigChanges = (originalConfig?: CoursePhaseConfig) => {
    if (!originalConfig) return true // Changed from false to true to enable saving when no config exists yet

    return (
      assessmentTemplateId !== (originalConfig.assessmentTemplateID || '') ||
      start?.getTime() !==
        (originalConfig.start ? new Date(originalConfig.start).getTime() : undefined) ||
      deadline?.getTime() !==
        (originalConfig.deadline ? new Date(originalConfig.deadline).getTime() : undefined) ||
      evaluationResultsVisible !== (originalConfig.evaluationResultsVisible || false) ||
      gradeSuggestionVisible !== (originalConfig.gradeSuggestionVisible ?? true) ||
      actionItemsVisible !== (originalConfig.actionItemsVisible ?? true)
    )
  }

  return {
    assessmentTemplateId,
    setAssessmentTemplateId,
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
  }
}
