'use client'

import { useCallback, useRef } from 'react'
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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PhaseNode } from './PhaseNode/PhaseNode'
import { Sidebar } from './components/sidebar'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { coursePhases, phaseTypes } from './data'
import { UserRound, Database } from 'lucide-react'
import { IconEdge } from './components/IconEdge'

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
          if (sourceNode && targetNode && sourceNode.position.y < targetNode.position.y) {
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

  return (
    <>
      <Sidebar />
      <div className='flex-grow h-full' ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={edgeOptions}
          fitView
        >
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
