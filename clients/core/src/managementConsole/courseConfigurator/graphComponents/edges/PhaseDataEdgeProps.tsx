import { Connection, Edge, MarkerType } from '@xyflow/react'
import { Database } from 'lucide-react'

export const PhaseDataEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
  label: (
    <>
      <Database className='w-5 h-5 text-purple-500' />
    </>
  ),
})
