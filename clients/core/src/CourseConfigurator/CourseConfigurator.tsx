import { CoursePhaseType } from '@/interfaces/course_phase_type'
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

export default function CourseConfiguratorPage() {
  const { courses } = useCourseStore()
  const courseId = useParams<{ courseId: string }>().courseId
  const course = courses.find((c) => c.id === courseId)
  const { setCoursePhaseTypes, appendCoursePhaseType, setCoursePhaseGraph, setCoursePhases } =
    useCourseConfigurationState()

  const [finishedGraphSetup, setFinishedGraphSetup] = useState(false)
  const [finishedCoursePhaseSetup, setFinishedCoursePhaseSetup] = useState(false)

  useEffect(() => {
    // If courseId changes, reset graph setup states
    setFinishedGraphSetup(false)
    setFinishedCoursePhaseSetup(false)
    setCoursePhases([])
    // Optionally refetch queries if needed
    refetchGraph()
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

  useEffect(() => {
    if (fetchedCoursePhaseTypes) {
      setCoursePhaseTypes([])
      // deep copy of course phase data
      fetchedCoursePhaseTypes.forEach((coursePhaseType) => {
        appendCoursePhaseType({
          id: coursePhaseType.id,
          name: coursePhaseType.name,
          initial_phase: coursePhaseType.initial_phase,
          required_input_meta_data: [...coursePhaseType.required_input_meta_data],
          provided_output_meta_data: [...coursePhaseType.provided_output_meta_data],
        })
      })
    }
  }, [appendCoursePhaseType, fetchedCoursePhaseTypes, setCoursePhaseTypes])

  useEffect(() => {
    if (fetchedCourseGraph) {
      console.log(fetchedCourseGraph)
      setCoursePhaseGraph([...fetchedCourseGraph])
      setFinishedGraphSetup(true)
    }
  }, [fetchedCourseGraph, setCoursePhaseGraph])

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
        {isCoursePhaseTypesError || isGraphError ? (
          <ErrorPage
            title='Error'
            description='Failed to fetch course phase types'
            message={error?.message || graphError?.message}
            onRetry={() => {
              refetchCoursePhaseTypes()
              refetchGraph()
            }}
          />
        ) : isCoursePhaseTypesPending ||
          isGraphPending ||
          !finishedCoursePhaseSetup ||
          !finishedGraphSetup ? (
          <Loader2 className='w-12 h-12 m-8' />
        ) : (
          <Canvas />
        )}
      </Card>
    </>
  )
}
