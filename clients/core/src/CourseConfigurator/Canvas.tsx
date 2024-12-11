import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  NodeTypes,
  EdgeTypes,
  Background,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PhaseNode } from './PhaseNode/PhaseNode'
import { Sidebar } from './components/Sidebar'
import { coursePhases, initialEdges } from './data'
import { IconEdge } from './Edges/IconEdge'
import { DeleteConfirmation } from './components/DeleteConfirmation'
import { getLayoutedElements } from './utils/getLayoutedElements'
import { useConnect } from './handlers/useConnect'
import { useValidation } from './handlers/useValidation'
import { useDrop } from './handlers/useDrop'
import { useDarkMode } from '@/contexts/DarkModeProvider'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
}

const edgeTypes: EdgeTypes = {
  iconEdge: IconEdge,
}

export function CourseConfigurator() {
  const initialNodes = coursePhases.map((phase) => ({
    id: phase.id || `no-valid-id-${Date.now()}`,
    type: 'phaseNode',
    position: phase.position,
    data: {},
  }))

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements({
    nodes: initialNodes,
    edges: initialEdges,
  })

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)
  const { theme } = useDarkMode()

  // For deletion confirmation dialog
  const [deleteDialogIsOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmationResolver, setDeleteConfirmationResolver] =
    useState<(value: boolean) => void | null>()
  const [toBeDeletedComponent, setToBeDeletedComponent] = useState<string>('')

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onBeforeDelete = useCallback(
    async ({ nodes: toBeDeletedNodes, edges: toBeDeletedEdges }) => {
      setDeleteDialogOpen(true)

      if (toBeDeletedNodes.length > 0) {
        setToBeDeletedComponent('a Course Phase')
      } else {
        setToBeDeletedComponent('an Edge')
      }

      const userDecision = await new Promise<boolean>((resolve) => {
        setDeleteConfirmationResolver(() => resolve)
      })

      if (userDecision) {
        return { nodes: toBeDeletedNodes, edges: toBeDeletedEdges }
      } else {
        return false
      }
    },
    [],
  )

  return (
    <>
      <Sidebar />
      <div className='flex-grow h-full' ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onBeforeDelete={onBeforeDelete}
          onConnect={useConnect(edges, nodes, setEdges)}
          onDrop={useDrop(reactFlowWrapper, setNodes)}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          isValidConnection={useValidation()}
          colorMode={theme}
          fitView
        >
          <DeleteConfirmation
            isOpen={deleteDialogIsOpen}
            setOpen={setDeleteDialogOpen}
            componentName={toBeDeletedComponent}
            onClick={(value: boolean) => {
              if (deleteConfirmationResolver) {
                deleteConfirmationResolver(value)
                setDeleteConfirmationResolver(undefined) // Clear the resolver
              }
            }}
          />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </>
  )
}

export const Canvas = () => {
  return (
    <div className='flex h-full'>
      <ReactFlowProvider>
        <CourseConfigurator />
      </ReactFlowProvider>
    </div>
  )
}
