import { useState, useEffect } from 'react'
import { useCoursePhaseConfigStore } from '../../../../../zustand/useCoursePhaseConfigStore'
import { CoursePhaseConfig } from '../../../../../interfaces/coursePhaseConfig'
import { EvaluationOptions } from '../interfaces/EvaluationOption'

export const useEvaluationOptions = () => {
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

  const { coursePhaseConfig: config } = useCoursePhaseConfigStore()

  useEffect(() => {
    if (config) {
      // Self evaluation
      setSelfEvaluationEnabled(config.selfEvaluationEnabled || false)
      setSelfEvaluationTemplate(config.selfEvaluationTemplate || '')
      setSelfEvaluationStart(
        config.selfEvaluationStart ? new Date(config.selfEvaluationStart) : undefined,
      )
      setSelfEvaluationDeadline(
        config.selfEvaluationDeadline ? new Date(config.selfEvaluationDeadline) : undefined,
      )

      // Peer evaluation
      setPeerEvaluationEnabled(config.peerEvaluationEnabled || false)
      setPeerEvaluationTemplate(config.peerEvaluationTemplate || '')
      setPeerEvaluationStart(
        config.peerEvaluationStart ? new Date(config.peerEvaluationStart) : undefined,
      )
      setPeerEvaluationDeadline(
        config.peerEvaluationDeadline ? new Date(config.peerEvaluationDeadline) : undefined,
      )

      // Tutor evaluation
      setTutorEvaluationEnabled(config.tutorEvaluationEnabled || false)
      setTutorEvaluationTemplate(config.tutorEvaluationTemplate || '')
      setTutorEvaluationStart(
        config.tutorEvaluationStart ? new Date(config.tutorEvaluationStart) : undefined,
      )
      setTutorEvaluationDeadline(
        config.tutorEvaluationDeadline ? new Date(config.tutorEvaluationDeadline) : undefined,
      )
    }
  }, [config])

  const evaluationOptions: EvaluationOptions = {
    self: {
      enabled: selfEvaluationEnabled,
      template: selfEvaluationTemplate,
      start: selfEvaluationStart,
      deadline: selfEvaluationDeadline,
    },
    peer: {
      enabled: peerEvaluationEnabled,
      template: peerEvaluationTemplate,
      start: peerEvaluationStart,
      deadline: peerEvaluationDeadline,
    },
    tutor: {
      enabled: tutorEvaluationEnabled,
      template: tutorEvaluationTemplate,
      start: tutorEvaluationStart,
      deadline: tutorEvaluationDeadline,
    },
  }

  const hasEvaluationChanges = (originalConfig?: CoursePhaseConfig) => {
    if (!originalConfig) return false

    return (
      // Self evaluation changes
      selfEvaluationEnabled !== (originalConfig.selfEvaluationEnabled || false) ||
      selfEvaluationTemplate !== (originalConfig.selfEvaluationTemplate || '') ||
      selfEvaluationStart?.getTime() !==
        (originalConfig.selfEvaluationStart
          ? new Date(originalConfig.selfEvaluationStart).getTime()
          : undefined) ||
      selfEvaluationDeadline?.getTime() !==
        (originalConfig.selfEvaluationDeadline
          ? new Date(originalConfig.selfEvaluationDeadline).getTime()
          : undefined) ||
      // Peer evaluation changes
      peerEvaluationEnabled !== (originalConfig.peerEvaluationEnabled || false) ||
      peerEvaluationTemplate !== (originalConfig.peerEvaluationTemplate || '') ||
      peerEvaluationStart?.getTime() !==
        (originalConfig.peerEvaluationStart
          ? new Date(originalConfig.peerEvaluationStart).getTime()
          : undefined) ||
      peerEvaluationDeadline?.getTime() !==
        (originalConfig.peerEvaluationDeadline
          ? new Date(originalConfig.peerEvaluationDeadline).getTime()
          : undefined) ||
      // Tutor evaluation changes
      tutorEvaluationEnabled !== (originalConfig.tutorEvaluationEnabled || false) ||
      tutorEvaluationTemplate !== (originalConfig.tutorEvaluationTemplate || '') ||
      tutorEvaluationStart?.getTime() !==
        (originalConfig.tutorEvaluationStart
          ? new Date(originalConfig.tutorEvaluationStart).getTime()
          : undefined) ||
      tutorEvaluationDeadline?.getTime() !==
        (originalConfig.tutorEvaluationDeadline
          ? new Date(originalConfig.tutorEvaluationDeadline).getTime()
          : undefined)
    )
  }

  return {
    // Self evaluation
    selfEvaluationEnabled,
    setSelfEvaluationEnabled,
    selfEvaluationTemplate,
    setSelfEvaluationTemplate,
    selfEvaluationStart,
    setSelfEvaluationStart,
    selfEvaluationDeadline,
    setSelfEvaluationDeadline,

    // Peer evaluation
    peerEvaluationEnabled,
    setPeerEvaluationEnabled,
    peerEvaluationTemplate,
    setPeerEvaluationTemplate,
    peerEvaluationStart,
    setPeerEvaluationStart,
    peerEvaluationDeadline,
    setPeerEvaluationDeadline,

    // Tutor evaluation
    tutorEvaluationEnabled,
    setTutorEvaluationEnabled,
    tutorEvaluationTemplate,
    setTutorEvaluationTemplate,
    tutorEvaluationStart,
    setTutorEvaluationStart,
    tutorEvaluationDeadline,
    setTutorEvaluationDeadline,

    // Computed values
    evaluationOptions,
    hasEvaluationChanges,
  }
}
