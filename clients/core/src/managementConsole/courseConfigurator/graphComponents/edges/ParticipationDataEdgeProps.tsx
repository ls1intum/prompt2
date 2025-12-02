import { Connection, Edge, MarkerType } from '@xyflow/react'

export const ParticipationDataEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
})
