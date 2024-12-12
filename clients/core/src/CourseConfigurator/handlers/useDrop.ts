import { useCallback } from 'react'
import { coursePhases } from '../data' // TODO: replace with real data
import { Node, useReactFlow } from '@xyflow/react'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'

export const useDrop = (reactFlowWrapper, setNodes) => {
  const { screenToFlowPosition } = useReactFlow()
  const { coursePhaseTypes } = useCourseConfigurationState()

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

        const coursePhase: CreateCoursePhase = {
          id: id,
          course_id: 'some_id',
          name: `New ${coursePhaseType.name}`,
          position: position,
          is_initial_phase: coursePhaseType.initial_phase,
          course_phase_type_id: coursePhaseType.id,
        }

        Object.assign(coursePhases, coursePhases.concat(coursePhase))

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
