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
import { IconEdge } from './Edges/IconEdge'
import { DeleteConfirmation } from './components/DeleteConfirmation'
import { getLayoutedElements } from './utils/getLayoutedElements'
import { useConnect } from './handlers/useConnect'
import { useValidation } from './handlers/useValidation'
import { useDrop } from './handlers/useDrop'
import { useDarkMode } from '@/contexts/DarkModeProvider'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
import { ParticipantEdgeProps } from './Edges/ParticipantEdgeProps'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { postNewCoursePhase } from '../network/mutations/postNewCoursePhase'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorPage } from '@/components/ErrorPage'
import { CoursePhaseGraphItem, CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'
import { updatePhaseGraph } from '../network/mutations/updatePhaseGraph'
import { useParams } from 'react-router-dom'
import { deleteCoursePhase } from '../network/mutations/deleteCoursePhase'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
}

const edgeTypes: EdgeTypes = {
  iconEdge: IconEdge,
}

export function CourseConfigurator() {
  // getting the data
  const queryClient = useQueryClient()
  const { courseId } = useParams<{ courseId: string }>()
  const { coursePhases, coursePhaseGraph, removeUnsavedCoursePhases } =
    useCourseConfigurationState()
  const initialNodes = coursePhases.map((phase) => ({
    id: phase.id || `no-valid-id-${Date.now()}`,
    type: 'phaseNode',
    position: phase.position,
    data: {},
  }))

  const initialEdges = coursePhaseGraph.map((item) => {
    return {
      id: 'edge-' + item.from_course_phase_id + '-' + item.to_course_phase_id,
      source: item.from_course_phase_id,
      target: item.to_course_phase_id,
      type: 'iconEdge',
    }
  })

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements({
    nodes: initialNodes,
    edges: initialEdges,
  })

  const designedEdges = layoutedEdges.map((edge) => {
    const participantEdge = ParticipantEdgeProps(edge)
    return {
      ...participantEdge,
      id: edge.id,
      sourceHandle: `participants-out-${edge.source}`,
      targetHandle: `participants-in-${edge.target}`,
    }
  })

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(designedEdges)
  const [isModified, setIsModified] = useState(false)

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
        setIsModified(true)
        return { nodes: toBeDeletedNodes, edges: toBeDeletedEdges }
      } else {
        return false
      }
    },
    [],
  )

  const handleRevert = () => {
    const filteredLayoutedNodes = layoutedNodes.filter(
      (node) => node.id && !node.id.startsWith('no-valid-id'),
    )

    const filteredEdges = designedEdges.filter(
      (edge) => edge.id && !edge.id.includes('no-valid-id'),
    )
    setNodes(filteredLayoutedNodes)
    setEdges(filteredEdges)
    removeUnsavedCoursePhases()
    setIsModified(false)
  }

  const { mutateAsync: mutateAsyncPhases, isError: isPhaseError } = useMutation({
    mutationFn: (coursePhase: CreateCoursePhase) => {
      return postNewCoursePhase(coursePhase)
    },
    onSuccess: (data: string | undefined) => {
      console.log('Received ID' + data)
      return data
    },
  })

  const { mutate: mutateGraph, isError: isGraphError } = useMutation({
    mutationFn: (coursePhaseGraphUpdate: CoursePhaseGraphUpdate) => {
      return updatePhaseGraph(courseId ?? '', coursePhaseGraphUpdate)
    },
    onSuccess: () => {
      // reload window to get the updated UI and Sidebar
      window.location.reload()
    },
  })

  const { mutate: mutateDeletePhase } = useMutation({
    mutationFn: (coursePhaseId: string) => {
      return deleteCoursePhase(coursePhaseId)
    },
    onSuccess: () => {},
  })

  const handleSave = async () => {
    const idReplacementMap: { [key: string]: string } = {}

    // 0.) Remove edges and nodes if need to be removed
    const nodesToRemove = coursePhases.filter(
      (phase) => phase.id && !nodes.find((node) => node.id === phase.id),
    )
    for (const node of nodesToRemove) {
      try {
        await mutateDeletePhase(node.id as string)
      } catch (err) {
        console.error('Error deleting course phase', err)
        return
      }
    }

    // 1.) Add additional nodes
    const newPhases = coursePhases.filter(
      (phase) => !phase.id || phase.id.startsWith('no-valid-id'),
    )
    // send array of phases to backend
    for (const phase of newPhases) {
      console.log(phase)
      const createPhase: CreateCoursePhase = {
        course_id: phase.course_id,
        name: phase.name,
        course_phase_type_id: phase.course_phase_type_id,
        is_initial_phase: phase.is_initial_phase,
      }

      try {
        const newId = await mutateAsyncPhases(createPhase)
        if (phase.id) {
          idReplacementMap[phase.id] = newId as string
        }
      } catch (err) {
        console.error('Error saving course phase', err)
        return
      }
    }

    // 2.) Update course phase order
    const updatedEdges = edges.map((edge) => {
      const newSource = idReplacementMap[edge.source] || edge.source
      const newTarget = idReplacementMap[edge.target] || edge.target
      return { ...edge, source: newSource, target: newTarget }
    })

    const orderArray: CoursePhaseGraphItem[] = updatedEdges.map((edge) => {
      return {
        from_course_phase_id: edge.source,
        to_course_phase_id: edge.target,
      }
    })

    const graphUpdate: CoursePhaseGraphUpdate = {
      initial_phase: coursePhases.find((phase) => phase.is_initial_phase)?.id ?? 'undefined',
      course_phase_graph: orderArray,
    }
    console.log(graphUpdate)
    try {
      await mutateGraph(graphUpdate)
      queryClient.invalidateQueries({
        queryKey: ['courses', 'course_phase_types', 'course_phase_graph'],
      })
      setIsModified(false)
      // TODO reload
    } catch (err) {
      console.error('Error saving course phase', err)
      return err
    }
  }

  // TODO: replace handle revert in error message to sth which reloads this whole component
  return (
    <>
      <Sidebar />
      <div className='flex-grow h-full flex flex-col' ref={reactFlowWrapper}>
        {(isPhaseError || isGraphError) && (
          <ErrorPage message='Failed to save the changes' onRetry={handleRevert} />
        )}
        {isModified && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Unsaved Changes</AlertTitle>
            <AlertDescription className='flex items-center justify-between'>
              <span>This board has been modified. Would you like to save your changes?</span>
              <div className='space-x-2'>
                <Button variant='outline' size='sm' onClick={handleRevert}>
                  Revert
                </Button>
                <Button variant='default' size='sm' onClick={handleSave}>
                  Save
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onBeforeDelete={onBeforeDelete}
          onConnect={useConnect(edges, nodes, setEdges, setIsModified)}
          onDrop={useDrop(reactFlowWrapper, setNodes, setIsModified)}
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
