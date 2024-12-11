'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Connection,
  Edge,
  NodeTypes,
  MarkerType,
  EdgeTypes,
  useReactFlow,
  getOutgoers,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PhaseNode } from './PhaseNode/PhaseNode'
import { Sidebar } from './components/sidebar'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { coursePhases, phaseTypes } from './data'
import { UserRound, Database } from 'lucide-react'
import { IconEdge } from './components/IconEdge'
import { DeleteConfirmation } from './components/DeleteConfirmation'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
}

const edgeTypes: EdgeTypes = {
  iconEdge: IconEdge,
}

const edgeOptions = {
  animated: true,
  style: {
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
}

export function CourseConfigurator() {
  const initialNodes = coursePhases.map((phase) => ({
    id: phase.id || `no-valid-id-${Date.now()}`,
    type: 'phaseNode',
    position: phase.position,
    data: {},
  }))

  const initialEdges: Edge[] = []

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { screenToFlowPosition } = useReactFlow()
  const { getNodes, getEdges } = useReactFlow()

  // For deletion confirmation dialog
  const [deleteDialogIsOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmationResolver, setDeleteConfirmationResolver] =
    useState<(value: boolean) => void | null>()
  const [toBeDeletedComponent, setToBeDeletedComponent] = useState<string>('')

  const onConnect = useCallback(
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
            const newEdge = {
              ...params,
              ...edgeOptions,
              type: 'iconEdge',
              style: { ...edgeOptions.style, stroke: '#3b82f6', strokeWidth: 3 },
              label: <UserRound className='w-5 h-5 text-blue-500' />,
            }
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
            const newEdge = {
              ...params,
              ...edgeOptions,
              type: 'iconEdge',
              style: { ...edgeOptions.style, stroke: '#22c55e', strokeDasharray: '5,5' },
              label: <Database className='w-5 h-5 text-green-500' />,
            }
            setEdges((eds) => addEdge(newEdge, eds))
          } else {
            console.log('Metadata connection not allowed: can only connect to subsequent phases.')
          }
        }
      }
    },
    [edges, nodes, setEdges],
  )

  // use Cycle Prevention to only have valid course trees
  const isValidConnection = useCallback(
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

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      if (reactFlowWrapper.current) {
        const coursePhaseTypeID = event.dataTransfer.getData('application/@xyflow/react')
        if (!coursePhaseTypeID) {
          console.log('No type found in drop event: ', coursePhaseTypeID)
          return
        }
        console.log(coursePhaseTypeID)

        const coursePhaseType = phaseTypes.find((phaseType) => phaseType.id === coursePhaseTypeID)
        if (!coursePhaseType) {
          console.error(`Unknown course phase type: ${coursePhaseTypeID}`)
          return
        }

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const id = `no-valid-id-${Date.now()}`

        const coursePhase: CreateCoursePhase = {
          id: id,
          course_id: 'some_id',
          name: `New ${coursePhaseType.name}`,
          position: position,
          is_initial_phase: coursePhaseType.initial_phase,
          course_phase_type_id: coursePhaseType.id,
        }

        Object.assign(coursePhases, coursePhases.concat(coursePhase))

        const newNode = {
          id: id,
          type: 'phaseNode',
          position: position,
          data: coursePhase,
        }

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [screenToFlowPosition, setNodes],
  )

  const onBeforeDelete = useCallback(
    async ({ nodes: toBeDeletedNodes, edges: toBeDeletedEdges }) => {
      console.log('Nodes to be deleted:', toBeDeletedNodes)
      console.log('Edges to be deleted:', toBeDeletedEdges)
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
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={edgeOptions}
          isValidConnection={isValidConnection}
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
