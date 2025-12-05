import { Connection, Edge, MarkerType } from '@xyflow/react'

export const PhaseDataEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
})
