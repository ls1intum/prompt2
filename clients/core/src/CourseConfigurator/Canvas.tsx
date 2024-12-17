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
import { CreateCoursePhase, UpdateCoursePhase } from '@/interfaces/course_phase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorPage } from '@/components/ErrorPage'
import { CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'
import { updatePhaseGraph } from '../network/mutations/updatePhaseGraph'
import { useParams } from 'react-router-dom'
import { deleteCoursePhase } from '../network/mutations/deleteCoursePhase'
import { handleSave } from './handlers/handleSave'
import { updateCoursePhase } from '../network/mutations/updateCoursePhase'

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
  const phaseNameModified = coursePhases.some((phase) => phase.is_modified)

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
      if (
        toBeDeletedNodes.filter(
          (node) =>
            node.id && coursePhases.some((phase) => phase.id === node.id && phase.is_initial_phase),
        ).length > 0
      ) {
        console.log('Cannot delete initial phase')
        return false
      }
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

  const { mutate: mutateDeletePhase, isError: isDeleteError } = useMutation({
    mutationFn: (coursePhaseId: string) => {
      return deleteCoursePhase(coursePhaseId)
    },
    onSuccess: () => {},
  })

  const { mutate: mutateRenamePhase, isError: isRenameError } = useMutation({
    mutationFn: (coursePhase: UpdateCoursePhase) => {
      return updateCoursePhase(coursePhase)
    },
    onSuccess: () => {},
  })

  const saveChanges = async () => {
    await handleSave({
      nodes,
      edges,
      coursePhases,
      mutateDeletePhase,
      mutateAsyncPhases,
      mutateRenamePhase,
      mutateGraph,
      queryClient,
      setIsModified,
    })
  }

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

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <>
      <Sidebar />
      <div className='flex-grow h-full flex flex-col' ref={reactFlowWrapper}>
        {(isPhaseError || isGraphError || isDeleteError || isRenameError) && (
          <ErrorPage message='Failed to save the changes' onRetry={handleRetry} />
        )}
        {(isModified || phaseNameModified) && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Unsaved Changes</AlertTitle>
            <AlertDescription className='flex items-center justify-between'>
              <span>This board has been modified. Would you like to save your changes?</span>
              <div className='space-x-2'>
                <Button variant='outline' size='sm' onClick={handleRevert}>
                  Revert
                </Button>
                <Button variant='default' size='sm' onClick={saveChanges}>
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
