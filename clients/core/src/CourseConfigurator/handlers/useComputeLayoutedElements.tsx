import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { getLayoutedElements } from '../utils/getLayoutedElements'
import { ParticipantEdgeProps } from '../Edges/ParticipantEdgeProps'
import { DataEdgeProps } from '../Edges/DataEdgeProps'

export const useComputeLayoutedElements = () => {
  const { coursePhases, coursePhaseGraph, metaDataGraph } = useCourseConfigurationState()

  const initialNodes = coursePhases.map((phase) => ({
    id: phase.id || `no-valid-id-${Date.now()}`,
    type: 'phaseNode',
    position: phase.position,
    data: {},
  }))

  const initialPersonEdges = coursePhaseGraph.map((item) => {
    return {
      id: 'person-edge-' + item.from_course_phase_id + '-' + item.to_course_phase_id,
      source: item.from_course_phase_id,
      target: item.to_course_phase_id,
      type: 'iconEdge',
    }
  })

  const initialMetaEdges = metaDataGraph.map((item) => {
    return {
      id: 'data-edge-' + item.from_course_phase_id + '-' + item.to_course_phase_id,
      source: item.from_course_phase_id,
      target: item.to_course_phase_id,
      type: 'iconEdge',
    }
  })

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements({
    nodes: initialNodes,
    edges: [...initialPersonEdges, ...initialMetaEdges],
  })

  const designedPersonEdges = layoutedEdges
    .filter((edge) => edge.id.startsWith('person-edge'))
    .map((edge) => {
      const participantEdge = ParticipantEdgeProps(edge)
      return {
        ...participantEdge,
        id: edge.id,
        sourceHandle: `participants-out-${edge.source}`,
        targetHandle: `participants-in-${edge.target}`,
      }
    })

  const designedMetaDataEdges = layoutedEdges
    .filter((edge) => edge.id.startsWith('data-edge'))
    .map((edge) => {
      const metaDataEdge = DataEdgeProps(edge)
      return {
        ...metaDataEdge,
        id: edge.id,
        sourceHandle: `metadata-out-${edge.source}`,
        targetHandle: `metadata-in-${edge.target}`,
      }
    })

  const designedEdges = [...designedPersonEdges, ...designedMetaDataEdges]

  return { nodes: layoutedNodes, edges: designedEdges }
}
