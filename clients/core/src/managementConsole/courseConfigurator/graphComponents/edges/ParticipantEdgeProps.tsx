import { Connection, Edge, MarkerType } from '@xyflow/react'
import { UserRound } from 'lucide-react'

export const ParticipantEdgeProps = (params: Edge | Connection) => ({
  ...params,
  animated: false,
  style: { stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: '5,5' },
  type: 'iconEdge',
  markerEnd: { type: MarkerType.ArrowClosed },
  label: (
    <>
      <UserRound className='w-5 h-5 text-blue-500' />
    </>
  ),
})
