import { useState, useEffect } from 'react'
import { useCoursePhaseConfigStore } from '../../../../../zustand/useCoursePhaseConfigStore'
import { CoursePhaseConfig } from '../../../../../interfaces/coursePhaseConfig'

export interface MainConfigState {
  assessmentTemplateId: string
  start?: Date
  deadline?: Date
  evaluationResultsVisible: boolean
}

export const useCoursePhaseConfigForm = () => {
  const [assessmentTemplateId, setAssessmentTemplateId] = useState<string>('')
  const [start, setStart] = useState<Date | undefined>(undefined)
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [evaluationResultsVisible, setEvaluationResultsVisible] = useState<boolean>(false)

  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()

  useEffect(() => {
    if (config) {
      setAssessmentTemplateId(config.assessmentTemplateID || '')
      setStart(config.start ? new Date(config.start) : undefined)
      setDeadline(config.deadline ? new Date(config.deadline) : undefined)
      setEvaluationResultsVisible(config.evaluationResultsVisible || false)
    }
  }, [config])

  const mainConfigState: MainConfigState = {
    assessmentTemplateId,
    start,
    deadline,
    evaluationResultsVisible,
  }

  const hasMainConfigChanges = (originalConfig?: CoursePhaseConfig) => {
    if (!originalConfig) return false

    return (
      assessmentTemplateId !== (originalConfig.assessmentTemplateID || '') ||
      start?.getTime() !==
        (originalConfig.start ? new Date(originalConfig.start).getTime() : undefined) ||
      deadline?.getTime() !==
        (originalConfig.deadline ? new Date(originalConfig.deadline).getTime() : undefined) ||
      evaluationResultsVisible !== (originalConfig.evaluationResultsVisible || false)
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
    mainConfigState,
    hasMainConfigChanges,
  }
}
