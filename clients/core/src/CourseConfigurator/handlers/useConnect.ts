import { addEdge, Connection, Edge } from '@xyflow/react'
import { useCallback } from 'react'
import { ParticipantEdgeProps } from '../Edges/ParticipantEdgeProps'
import { DataEdgeProps } from '../Edges/DataEdgeProps'

export const useConnect = (edges, nodes, setEdges) => {
  return useCallback(
    (params: Edge | Connection) => {
      if (params.sourceHandle && params.targetHandle) {
        const sourceHandle = params.sourceHandle as string
        const targetHandle = params.targetHandle as string

        if (sourceHandle.startsWith('participants') && targetHandle.startsWith('participants')) {
          const targetHasIncoming = edges.some(
            (edge) =>
              edge.target === params.target && edge.targetHandle?.startsWith('participants'),
          )
          const sourceHasOutgoing = edges.some(
            (edge) =>
              edge.source === params.source && edge.sourceHandle?.startsWith('participants'),
          )

          if (!targetHasIncoming && !sourceHasOutgoing) {
            const newEdge = ParticipantEdgeProps(params)
            setEdges((eds) => addEdge(newEdge, eds))
          } else {
            console.log(
              'Participants connection not allowed: nodes can have at most one incoming and one outgoing participants edge.',
            )
          }
        } else if (sourceHandle.startsWith('metadata') && targetHandle.startsWith('metadata')) {
          const sourceNode = nodes.find((node) => node.id === params.source)
          const targetNode = nodes.find((node) => node.id === params.target)
          if (sourceNode && targetNode) {
            const newEdge = DataEdgeProps(params)
            setEdges((eds) => addEdge(newEdge, eds))
          } else {
            console.log('Metadata connection not allowed: can only connect to subsequent phases.')
          }
        }
      }
    },
    [edges, nodes, setEdges],
  )
}
