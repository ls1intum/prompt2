// src/hooks/useCourseSetup.ts
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { CoursePhaseType, CoursePhaseTypeMetaDataItem } from '@tumaet/prompt-shared-state'
import { CoursePhaseGraphItem } from '../interfaces/coursePhaseGraphItem'
import { MetaDataGraphItem } from '../interfaces/courseMetaGraphItem'
import { ApplicationForm } from '../../applicationAdministration/interfaces/form/applicationForm'
import { AdditionalScore } from '../../applicationAdministration/interfaces/additionalScore/additionalScore'

import { getAllCoursePhaseTypes } from '@core/network/queries/coursePhaseTypes'
import { getCoursePhaseGraph } from '@core/network/queries/coursePhaseGraph'
import { getMetaDataGraph } from '@core/network/queries/courseMetaDataGraph'
import { getApplicationForm } from '@core/network/queries/applicationForm'
import { getAdditionalScoreNames } from '@core/network/queries/additionalScoreNames'

import { useCourseConfigurationState } from '../zustand/useCourseConfigurationStore'
import { useCourseStore } from '@tumaet/prompt-shared-state'

export function useCourseConfiguratorDataSetup() {
  const { courses } = useCourseStore()
  const courseId = useParams<{ courseId: string }>().courseId || ''
  const course = courses.find((c) => c.id === courseId)
  const {
    setCoursePhaseTypes,
    appendCoursePhaseType,
    setCoursePhaseGraph,
    setCoursePhases,
    setMetaDataGraph,
  } = useCourseConfigurationState()

  // Flags to delay canvas load until everything is ready
  const [finishedGraphSetup, setFinishedGraphSetup] = useState<string>('')
  const [finishedCoursePhaseSetup, setFinishedCoursePhaseSetup] = useState<string>('')

  // Queries
  const {
    data: fetchedCoursePhaseTypes,
    isPending: isCoursePhaseTypesPending,
    error,
    isError: isCoursePhaseTypesError,
    refetch: refetchCoursePhaseTypes,
  } = useQuery<CoursePhaseType[]>({
    queryKey: ['course_phase_types'],
    queryFn: getAllCoursePhaseTypes,
  })

  const {
    data: fetchedCourseGraph,
    isPending: isGraphPending,
    error: graphError,
    isError: isGraphError,
    refetch: refetchGraph,
  } = useQuery<CoursePhaseGraphItem[]>({
    queryKey: ['course_phases', 'course_phase_graph', courseId],
    queryFn: () => getCoursePhaseGraph(courseId),
    enabled: !!courseId,
  })

  const {
    data: fetchedMetaDataGraph,
    isPending: isMetaGraphPending,
    error: metaGraphError,
    isError: isMetaGraphError,
    refetch: refetchMetaGraph,
  } = useQuery<MetaDataGraphItem[]>({
    queryKey: ['course_phases', 'meta_phase_graph', courseId],
    queryFn: () => getMetaDataGraph(courseId),
    enabled: !!courseId,
  })

  // Get the application phase from the course phases.
  const applicationPhase = course?.coursePhases.find(
    (phase) => phase.coursePhaseType === 'Application',
  )

  const {
    data: fetchedApplicationForm,
    isPending: isFetchingApplicationForm,
    isError: isApplicationFormError,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', applicationPhase?.id],
    queryFn: () => getApplicationForm(applicationPhase?.id || ''),
    enabled: !!applicationPhase?.id,
  })

  const {
    data: fetchedAdditionalScores,
    isPending: isAdditionalScoresPending,
    isError: isAdditionalScoresError,
  } = useQuery<AdditionalScore[]>({
    queryKey: ['application_participations', applicationPhase?.id],
    queryFn: () => getAdditionalScoreNames(applicationPhase?.id || ''),
    enabled: !!applicationPhase?.id,
  })

  // Combine error and pending flags.
  const isError =
    isCoursePhaseTypesError ||
    isGraphError ||
    isMetaGraphError ||
    isApplicationFormError ||
    isAdditionalScoresError

  const isPending =
    isCoursePhaseTypesPending ||
    isGraphPending ||
    isMetaGraphPending ||
    (!!applicationPhase?.id && (isFetchingApplicationForm || isAdditionalScoresPending))

  // Set up course phase types with additional metadata for application phase.
  useEffect(() => {
    if (fetchedCoursePhaseTypes) {
      setCoursePhaseTypes([]) // Clear existing state
      fetchedCoursePhaseTypes.forEach((coursePhaseType) => {
        const additionalMetaData: CoursePhaseTypeMetaDataItem[] = []

        if (
          coursePhaseType.name === 'Application' &&
          fetchedApplicationForm &&
          !isAdditionalScoresPending
        ) {
          const applicationAnswers: { key: string; type: string }[] = []

          fetchedApplicationForm.questionsMultiSelect
            .filter(
              (question) =>
                question.accessKey !== undefined && question.accessibleForOtherPhases === true,
            )
            .forEach((question) => {
              applicationAnswers.push({ key: question.accessKey ?? '', type: 'Multi-Select' })
            })

          fetchedApplicationForm.questionsText
            .filter(
              (question) =>
                question.accessKey !== undefined && question.accessibleForOtherPhases === true,
            )
            .forEach((question) => {
              applicationAnswers.push({ key: question.accessKey ?? '', type: 'Text' })
            })

          if (applicationAnswers.length > 0) {
            additionalMetaData.push({
              name: 'applicationAnswers',
              // Convert the object array to a properly formatted JSON string
              type: JSON.stringify(applicationAnswers),
            })
          }

          if (fetchedAdditionalScores) {
            const additionScores: string[] = []
            fetchedAdditionalScores.forEach((score) => {
              additionScores.push(score.name)
            })
            additionalMetaData.push({
              name: 'additionalScores',
              type: JSON.stringify(additionScores),
            })
          }

          additionalMetaData.push({ name: 'applicationScore', type: 'integer' })
        }

        appendCoursePhaseType({
          id: coursePhaseType.id,
          name: coursePhaseType.name,
          initialPhase: coursePhaseType.initialPhase,
          requiredInputMetaData: [...coursePhaseType.requiredInputMetaData],
          providedOutputMetaData: [
            ...coursePhaseType.providedOutputMetaData,
            ...additionalMetaData,
          ],
        })
      })
    }
  }, [
    fetchedCoursePhaseTypes,
    fetchedApplicationForm,
    fetchedAdditionalScores,
    isAdditionalScoresPending,
    appendCoursePhaseType,
    setCoursePhaseTypes,
  ])

  // Set up the course graph and metadata graph.
  useEffect(() => {
    if (fetchedCourseGraph && fetchedMetaDataGraph) {
      setCoursePhaseGraph([...fetchedCourseGraph])
      setMetaDataGraph([...fetchedMetaDataGraph])
      setFinishedGraphSetup(courseId)
    }
  }, [fetchedCourseGraph, fetchedMetaDataGraph, setCoursePhaseGraph, setMetaDataGraph, courseId])

  // Set up the course phases.
  useEffect(() => {
    if (course) {
      setCoursePhases(
        course.coursePhases.map((phase) => ({
          ...phase,
          position: { x: 0, y: 0 },
          metaData: [],
        })),
      )
    } else {
      console.error('Course not found')
    }
    setFinishedCoursePhaseSetup(courseId)
  }, [course, setCoursePhases, courseId])

  // A flag to indicate that both graph and course phase setups are finished.
  const finishedSetup = finishedGraphSetup === courseId && finishedCoursePhaseSetup === courseId

  // A combined refetch function.
  const refetchAll = () => {
    refetchCoursePhaseTypes()
    refetchGraph()
    refetchMetaGraph()
  }

  return {
    courseId,
    isError,
    isPending,
    error: error || graphError || metaGraphError,
    finishedSetup,
    refetchAll,
  }
}
