import { useCallback, useEffect, useRef, useState } from 'react'
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
import { CourseConfigSidebar } from './components/CourseConfigSidebar'
import { IconEdge } from './Edges/IconEdge'
import { DeleteConfirmation } from './components/DeleteConfirmation'
import { useConnect } from './handlers/useConnect'
import { useValidation } from './handlers/useValidation'
import { useDrop } from './handlers/useDrop'
import { useDarkMode } from '@/contexts/DarkModeProvider'
import { useCourseConfigurationState } from '@/zustand/useCourseConfigurationStore'
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
import { useAuthStore } from '@/zustand/useAuthStore'
import { getPermissionString, Role } from '@/interfaces/permission_roles'
import { useCourseStore } from '@/zustand/useCourseStore'
import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'
import { updateMetaDataGraph } from '../network/mutations/updateMetaDataGraph'
import { useComputeLayoutedElements } from './handlers/useComputeLayoutedElements'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
}

const edgeTypes: EdgeTypes = {
  iconEdge: IconEdge,
}

export function CourseConfigurator() {
  // getting the data
  const { theme } = useDarkMode()
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  // TODO: revise if admin should have access to edit in long run
  const canEdit =
    permissions.includes(
      getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semester_tag),
    ) || permissions.includes(Role.PROMPT_ADMIN)

  const queryClient = useQueryClient()
  const { coursePhases, coursePhaseGraph, metaDataGraph, removeUnsavedCoursePhases } =
    useCourseConfigurationState()

  const { nodes: layoutedInitialNodes, edges: layoutedInitalEdges } = useComputeLayoutedElements()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedInitialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedInitalEdges)
  const [isModified, setIsModified] = useState(false)
  const phaseNameModified = coursePhases.some((phase) => phase.is_modified)

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
      return data
    },
  })

  const { mutate: mutateCoursePhaseGraph, isError: isGraphError } = useMutation({
    mutationFn: (coursePhaseGraphUpdate: CoursePhaseGraphUpdate) => {
      return updatePhaseGraph(courseId ?? '', coursePhaseGraphUpdate)
    },
  })

  const { mutate: mutateMetaDataGraph, isError: isMetaDataGraphError } = useMutation({
    mutationFn: (updatedMetaDataGraph: MetaDataGraphItem[]) => {
      return updateMetaDataGraph(courseId ?? '', updatedMetaDataGraph)
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

  const isError =
    isPhaseError || isGraphError || isDeleteError || isRenameError || isMetaDataGraphError

  const saveChanges = async () => {
    await handleSave({
      nodes,
      edges,
      coursePhases,
      mutateDeletePhase,
      mutateAsyncPhases,
      mutateRenamePhase,
      mutateCoursePhaseGraph,
      mutateMetaDataGraph,
      queryClient,
      setIsModified,
    })
  }

  const handleRevert = () => {
    const filteredLayoutedNodes = layoutedInitialNodes.filter(
      (node) => node.id && !node.id.startsWith('no-valid-id'),
    )

    const filteredEdges = layoutedInitalEdges.filter(
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
      <CourseConfigSidebar canEdit={canEdit} />
      <div className='flex-grow h-full flex flex-col' ref={reactFlowWrapper}>
        {isError && <ErrorPage message='Failed to save the changes' onRetry={handleRetry} />}
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
          nodesDraggable={canEdit}
          nodesConnectable={canEdit}
          connectOnClick={canEdit}
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
