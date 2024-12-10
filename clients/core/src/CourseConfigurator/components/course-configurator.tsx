'use client'

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Connection,
  Edge,
  NodeTypes,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PhaseNode } from './phase-node'
import { Sidebar } from './sidebar'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { coursePhases, phaseTypes } from './data'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
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
    data: phase,
  }))

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

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
              type: 'participants',
              style: { ...edgeOptions.style, stroke: '#3b82f6', strokeWidth: 3 },
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
              type: 'metadata',
              style: { ...edgeOptions.style, stroke: '#22c55e', strokeDasharray: '5,5' },
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

      if (reactFlowWrapper.current && reactFlowInstance) {
        const type = event.dataTransfer.getData('application/reactflow')

        if (typeof type === 'undefined' || !type) {
          return
        }

        const coursePhaseType = phaseTypes.find((phaseType) => phaseType.id === type)
        if (!coursePhaseType) {
          console.error(`Unknown course phase type: ${type}`)
          return
        }

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })

        const coursePhase: CreateCoursePhase = {
          course_id: 'some_id',
          name: `New ${coursePhaseType.name}`,
          position: position,
          is_initial_phase: coursePhaseType.initial_phase,
          course_phase_type_id: coursePhaseType.id,
        }

        const newNode = {
          id: `no-valid-id-${Date.now()}`,
          type: 'phaseNode',
          position: position,
          data: coursePhase,
        }

        setNodes((nds) => nds.concat(newNode))
      }
    },
    [reactFlowInstance, setNodes],
  )

  return (
    <div className='flex h-full'>
      <ReactFlowProvider>
        <Sidebar />
        <div className='flex-grow h-full' ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={edgeOptions}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
