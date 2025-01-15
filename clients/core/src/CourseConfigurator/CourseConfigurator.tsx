import { CoursePhaseType, MetaDataItem } from '@/interfaces/course_phase_type'
import { Canvas } from './Canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllCoursePhaseTypes } from '../network/queries/coursePhaseTypes'
import { useQuery } from '@tanstack/react-query'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { useEffect, useState } from 'react'
import { ErrorPage } from '@/components/ErrorPage'
import { useParams } from 'react-router-dom'
import { getCoursePhaseGraph } from '../network/queries/coursePhaseGraph'
import { CoursePhaseGraphItem } from '@/interfaces/course_phase_graph'
import { useCourseStore } from '@/zustand/useCourseStore'
import { Loader2 } from 'lucide-react'
import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'
import { getMetaDataGraph } from '../network/queries/courseMetaDataGraph'
import { getApplicationForm } from '../network/queries/applicationForm'
import { ApplicationForm } from '@/interfaces/application_form'
import { AdditionalScore } from '@/interfaces/additional_score'
import { getAdditionalScoreNames } from '../network/queries/additionalScoreNames'

export default function CourseConfiguratorPage() {
  const { courses } = useCourseStore()
  const courseId = useParams<{ courseId: string }>().courseId
  const course = courses.find((c) => c.id === courseId)
  const {
    setCoursePhaseTypes,
    appendCoursePhaseType,
    setCoursePhaseGraph,
    setCoursePhases,
    setMetaDataGraph,
  } = useCourseConfigurationState()

  // makes sure to delay the loading of the canvas until all data is fetched and set
  const [finishedGraphSetup, setFinishedGraphSetup] = useState(false)
  const [finishedCoursePhaseSetup, setFinishedCoursePhaseSetup] = useState(false)
  const [finishedMetaDataGraphSetup, setFinishedMetaDataGraphSetup] = useState(false)
  const finishedSetup = finishedGraphSetup && finishedCoursePhaseSetup && finishedMetaDataGraphSetup

  useEffect(() => {
    // If courseId changes, reset graph setup states
    setFinishedGraphSetup(false)
    setFinishedCoursePhaseSetup(false)
    setFinishedMetaDataGraphSetup(false)
    setCoursePhases([])
    // Optionally refetch queries if needed
    refetchGraph()
    refetchMetaGraph()
  }, [courseId])

  const {
    data: fetchedCoursePhaseTypes,
    isPending: isCoursePhaseTypesPending,
    error,
    isError: isCoursePhaseTypesError,
    refetch: refetchCoursePhaseTypes,
  } = useQuery<CoursePhaseType[]>({
    queryKey: ['course_phase_types'],
    queryFn: () => getAllCoursePhaseTypes(),
  })

  const {
    data: fetchedCourseGraph,
    isPending: isGraphPending,
    error: graphError,
    isError: isGraphError,
    refetch: refetchGraph,
  } = useQuery<CoursePhaseGraphItem[]>({
    queryKey: ['course_phases', 'course_phase_graph', courseId],
    queryFn: () => getCoursePhaseGraph(courseId ?? ''),
  })

  const {
    data: fetchedMetaDataGraph,
    isPending: isMetaGraphPending,
    error: metaGraphError,
    isError: iseMetaGraphError,
    refetch: refetchMetaGraph,
  } = useQuery<MetaDataGraphItem[]>({
    queryKey: ['course_phases', 'meta_phase_graph', courseId],
    queryFn: () => getMetaDataGraph(courseId ?? ''),
  })

  // get the application form for the exported meta data details
  const applicationPhase = course?.course_phases.find(
    (phase) => phase.course_phase_type === 'Application',
  )
  const {
    data: fetchedApplicationForm,
    isPending: isFetchingApplicationForm,
    isError: isApplicationFormError,
  } = useQuery<ApplicationForm>({
    queryKey: ['application_form', applicationPhase?.id],
    queryFn: () => getApplicationForm(applicationPhase?.id ?? ''),
    enabled: applicationPhase?.id !== undefined,
  })

  const {
    data: fetchedAdditionalScores,
    isPending: isAdditionalScoresPending,
    isError: isAdditionalScoresError,
  } = useQuery<AdditionalScore[]>({
    queryKey: ['application_participations', applicationPhase?.id],
    queryFn: () => getAdditionalScoreNames(applicationPhase?.id ?? ''),
    enabled: applicationPhase?.id !== undefined,
  })

  const isError =
    isCoursePhaseTypesError ||
    isGraphError ||
    iseMetaGraphError ||
    isApplicationFormError ||
    isAdditionalScoresError
  const isPending =
    isCoursePhaseTypesPending ||
    isGraphPending ||
    isMetaGraphPending ||
    (applicationPhase?.id !== undefined && isFetchingApplicationForm) ||
    (applicationPhase?.id !== undefined && isAdditionalScoresPending)

  useEffect(() => {
    if (fetchedCoursePhaseTypes) {
      setCoursePhaseTypes([])
      // deep copy of course phase data
      fetchedCoursePhaseTypes.forEach((coursePhaseType) => {
        const additionalMetaData: MetaDataItem[] = []
        if (
          coursePhaseType.name === 'Application' &&
          fetchedApplicationForm &&
          fetchedAdditionalScores
        ) {
          fetchedApplicationForm.questions_multi_select
            .filter(
              (question) =>
                question.access_key !== undefined && question.accessible_for_other_phases === true,
            )
            .forEach((question) => {
              additionalMetaData.push({
                name: question.access_key ?? 'undefined',
                type: 'array',
              })
            })
          fetchedApplicationForm.questions_text
            .filter(
              (question) =>
                question.access_key !== undefined && question.accessible_for_other_phases === true,
            )
            .forEach((question) => {
              additionalMetaData.push({
                name: question.access_key ?? 'undefined',
                type: 'string',
              })
            })

          fetchedAdditionalScores.forEach((score) => {
            additionalMetaData.push({
              name: score.name,
              type: 'integer',
            })
          })
          additionalMetaData.push({ name: 'assessmentScore', type: 'integer' })
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
    appendCoursePhaseType,
    fetchedCoursePhaseTypes,
    setCoursePhaseTypes,
    fetchedApplicationForm,
    fetchedAdditionalScores,
  ])

  useEffect(() => {
    if (fetchedCourseGraph) {
      setCoursePhaseGraph([...fetchedCourseGraph])
      setFinishedGraphSetup(true)
    }
  }, [fetchedCourseGraph, setCoursePhaseGraph])

  useEffect(() => {
    if (fetchedMetaDataGraph) {
      setMetaDataGraph([...fetchedMetaDataGraph])
      setFinishedMetaDataGraphSetup(true)
    }
  }, [fetchedMetaDataGraph, setMetaDataGraph])

  useEffect(() => {
    if (!course) {
      // TODO replace by error page
      console.log('Course not found')
    } else {
      setCoursePhases([
        ...course.course_phases.map((phase) => ({
          ...phase,
          position: { x: 0, y: 0 },
          meta_data: [],
        })),
      ])
    }
    setFinishedCoursePhaseSetup(true)
  }, [course, setCoursePhases, courseId])

  return (
    <>
      <Card className='m-8' key={courseId}>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>Follow these steps to create your course flow:</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className='list-decimal list-inside space-y-2'>
            <li>Drag course phases from the sidebar onto the canvas</li>
            <li>Connect phases by dragging from one node&apos;s handle to another</li>
            <li>Edit phase details by clicking the &quot;Edit&quot; button on each node</li>
            <li>Arrange your nodes to create a logical course flow</li>
          </ol>
        </CardContent>
      </Card>

      <Card className='m-8'>
        {isError ? (
          <ErrorPage
            title='Error'
            description='Failed to fetch course phase types'
            message={error?.message || graphError?.message || metaGraphError?.message}
            onRetry={() => {
              refetchCoursePhaseTypes()
              refetchGraph()
              refetchMetaGraph()
            }}
          />
        ) : isPending || !finishedSetup ? (
          <div className='flex justify-center items-center h-64'>
            <Loader2 className='h-12 w-12 animate-spin text-primary' />
          </div>
        ) : (
          <Canvas />
        )}
      </Card>
    </>
  )
}
