import { useCallback } from 'react'
import { Node, useReactFlow } from '@xyflow/react'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'

export const useDrop = (reactFlowWrapper, setNodes) => {
  const { screenToFlowPosition } = useReactFlow()
  const { coursePhaseTypes, appendCoursePhase } = useCourseConfigurationState()

  return useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (reactFlowWrapper.current) {
        const coursePhaseTypeID = event.dataTransfer.getData('application/@xyflow/react')
        if (!coursePhaseTypeID) {
          console.log('No type found in drop event: ', coursePhaseTypeID)
          return
        }

        const coursePhaseType = coursePhaseTypes.find(
          (phaseType) => phaseType.id === coursePhaseTypeID,
        )
        if (!coursePhaseType) {
          console.error(`Unknown course phase type: ${coursePhaseTypeID}`)
          return
        }

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const id = `no-valid-id-${Date.now()}`

        const coursePhase: CoursePhasePosition = {
          id: id,
          course_id: 'some_id', // TODO replace with real course id
          name: `New ${coursePhaseType.name}`,
          position: position,
          is_initial_phase: coursePhaseType.initial_phase,
          course_phase_type_id: coursePhaseType.id,
          meta_data: [], // TODO: maybe fix this to be {} instead of []
        }

        appendCoursePhase(coursePhase)

        const newNode: Node = {
          id: id,
          type: 'phaseNode',
          position: position,
          data: {},
        }

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [coursePhaseTypes, reactFlowWrapper, screenToFlowPosition, setNodes],
  )
}
