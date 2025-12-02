import { Connection, Edge, MarkerType } from '@xyflow/react'

export const ParticipantEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
})
