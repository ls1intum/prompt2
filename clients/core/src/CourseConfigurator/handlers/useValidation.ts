import { getOutgoers, useReactFlow } from '@xyflow/react'
import { useCallback } from 'react'

// used to prevent cycles
export const useValidation = () => {
  const { getNodes, getEdges } = useReactFlow()

  return useCallback(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const currentNodes = getNodes()
      const currentEdges = getEdges()
      const target = currentNodes.find((node) => node.id === connection.target)
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false

        visited.add(node.id)

        for (const outgoer of getOutgoers(node, currentNodes, currentEdges)) {
          if (outgoer.id === connection.source) return true
          if (hasCycle(outgoer, visited)) return true
        }
      }

      if (target?.id === connection.source) return false
      return !hasCycle(target)
    },
    [getNodes, getEdges],
  )
}
