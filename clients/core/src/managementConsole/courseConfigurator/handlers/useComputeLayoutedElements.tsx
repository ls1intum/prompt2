import { useCourseConfigurationState } from '../zustand/useCourseConfigurationStore'
import { getLayoutedElements } from '../utils/getLayoutedElements'
import { ParticipantEdgeProps } from '../graphComponents/edges/ParticipantEdgeProps'
import { DataEdgeProps } from '../graphComponents/edges/DataEdgeProps'

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
      id: 'person-edge-' + item.fromCoursePhaseID + '-' + item.toCoursePhaseID,
      source: item.fromCoursePhaseID,
      target: item.toCoursePhaseID,
      type: 'iconEdge',
    }
  })

  const initialMetaEdges = metaDataGraph.map((item) => {
    return {
      id:
        'data-edge-from-metadata-out-phase-' +
        item.fromCoursePhaseID +
        '-dto-' +
        item.fromCoursePhaseDtoID +
        '-to-metadata-in-phase-' +
        item.toCoursePhaseID +
        '-dto-' +
        item.toCoursePhaseDtoID,
      source: item.fromCoursePhaseID,
      sourceHandle: `metadata-out-phase-${item.fromCoursePhaseID}-dto-${item.fromCoursePhaseDtoID}`,
      targetHandle: `metadata-in-phase-${item.toCoursePhaseID}-dto-${item.toCoursePhaseDtoID}`,
      target: item.toCoursePhaseID,
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
        sourceHandle: metaDataEdge.sourceHandle,
        targetHandle: metaDataEdge.targetHandle,
      }
    })

  const designedEdges = [...designedPersonEdges, ...designedMetaDataEdges]

  return { nodes: layoutedNodes, edges: designedEdges }
}
