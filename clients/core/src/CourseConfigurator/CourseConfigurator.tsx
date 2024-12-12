import { CoursePhaseType } from '@/interfaces/course_phase_type'
import { Canvas } from './Canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllCoursePhaseTypes } from '../network/queries/coursePhaseTypes'
import { useQuery } from '@tanstack/react-query'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { useEffect } from 'react'
import { ErrorPage } from '@/components/ErrorPage'

export default function CourseConfiguratorPage() {
  const { setCoursePhaseTypes, appendCoursePhaseType } = useCourseConfigurationState()
  const {
    data: fetchedCoursePhaseTypes,
    error,
    isError,
    refetch,
  } = useQuery<CoursePhaseType[]>({
    queryKey: ['course_phase_types'],
    queryFn: () => getAllCoursePhaseTypes(),
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

  return (
    <>
      <Card className='m-8'>
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
            message={error?.message}
            onRetry={() => refetch()}
          />
        ) : (
          <Canvas />
        )}
      </Card>
    </>
  )
}
