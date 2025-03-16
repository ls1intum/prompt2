import { Connection, Edge, MarkerType } from '@xyflow/react'
import { Database } from 'lucide-react'

export const ParticipationDataEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
  label: (
    <>
      <Database className='w-5 h-5 text-green-500' />
    </>
  ),
})
