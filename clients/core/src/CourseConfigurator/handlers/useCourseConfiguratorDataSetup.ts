// src/hooks/useCourseSetup.ts
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { CoursePhaseType, MetaDataItem } from '@/interfaces/course_phase_type'
import { CoursePhaseGraphItem } from '@/interfaces/course_phase_graph'
import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'
import { ApplicationForm } from '@/interfaces/application_form'
import { AdditionalScore } from '@/interfaces/additional_score'

import { getAllCoursePhaseTypes } from '../../network/queries/coursePhaseTypes'
import { getCoursePhaseGraph } from '../../network/queries/coursePhaseGraph'
import { getMetaDataGraph } from '../../network/queries/courseMetaDataGraph'
import { getApplicationForm } from '../../network/queries/applicationForm'
import { getAdditionalScoreNames } from '../../network/queries/additionalScoreNames'

import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { useCourseStore } from '@/zustand/useCourseStore'

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
  const applicationPhase = course?.course_phases.find(
    (phase) => phase.course_phase_type === 'Application',
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
        const additionalMetaData: MetaDataItem[] = []

        if (
          coursePhaseType.name === 'Application' &&
          fetchedApplicationForm &&
          !isAdditionalScoresPending
        ) {
          const applicationAnswers: { key: string; type: string }[] = []

          fetchedApplicationForm.questions_multi_select
            .filter(
              (question) =>
                question.access_key !== undefined && question.accessible_for_other_phases === true,
            )
            .forEach((question) => {
              applicationAnswers.push({ key: question.access_key ?? '', type: 'Multi-Select' })
            })

          fetchedApplicationForm.questions_text
            .filter(
              (question) =>
                question.access_key !== undefined && question.accessible_for_other_phases === true,
            )
            .forEach((question) => {
              applicationAnswers.push({ key: question.access_key ?? '', type: 'Text' })
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
          initial_phase: coursePhaseType.initial_phase,
          required_input_meta_data: [...coursePhaseType.required_input_meta_data],
          provided_output_meta_data: [
            ...coursePhaseType.provided_output_meta_data,
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
        course.course_phases.map((phase) => ({
          ...phase,
          position: { x: 0, y: 0 },
          meta_data: [],
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
