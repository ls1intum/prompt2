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
import { PhaseNode } from './graphComponents/phaseNode/PhaseNode'
import { CourseConfigSidebar } from './components/CourseConfigSidebar'
import { IconEdge } from './graphComponents/edges/IconEdge'
import { useConnect } from './handlers/useConnect'
import { useValidation } from './handlers/useValidation'
import { useDrop } from './handlers/useDrop'
import { useDarkMode } from '@/contexts/DarkModeProvider'
import { useCourseConfigurationState } from './zustand/useCourseConfigurationStore'
import { Alert, AlertDescription, AlertTitle } from '@tumaet/prompt-ui-components'
import { AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button, ErrorPage } from '@tumaet/prompt-ui-components'
import { useParams } from 'react-router-dom'
import { handleSave } from './handlers/handleSave'
import { useAuthStore, useCourseStore } from '@tumaet/prompt-shared-state'
import { getPermissionString, Role } from '@tumaet/prompt-shared-state'
import { useComputeLayoutedElements } from './handlers/useComputeLayoutedElements'
import { useDeleteConfirmation } from './handlers/useDeleteConfirmation'
import { useMutations } from './handlers/useGraphMutations'

const nodeTypes: NodeTypes = {
  phaseNode: PhaseNode,
}

const edgeTypes: EdgeTypes = {
  iconEdge: IconEdge,
}

export function CourseConfigurator() {
  // ---------- Data and Contexts ----------
  const { theme } = useDarkMode()
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourseStore()
  const course = courses.find((c) => c.id === courseId)
  const { permissions } = useAuthStore()
  const canEdit =
    permissions.includes(
      getPermissionString(Role.COURSE_LECTURER, course?.name, course?.semesterTag),
    ) || permissions.includes(Role.PROMPT_ADMIN)

  const queryClient = useQueryClient()
  const { coursePhases, removeUnsavedCoursePhases, setCoursePhases } = useCourseConfigurationState()

  // ---------- Layout and Flow States ----------
  const { nodes: layoutedInitialNodes, edges: layoutedInitialEdges } = useComputeLayoutedElements()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedInitialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedInitialEdges)
  const [isModified, setIsModified] = useState(false) // TODO: inject this into the state -> shall be allowed to set from somewhere else (i.e. name changes)
  const phaseNameModified = coursePhases.some((phase) => phase.isModified)

  // ---------- Delete Confirmation ----------
  const { onBeforeDelete, DeleteConfirmationComponent } = useDeleteConfirmation({
    coursePhases,
    setIsModified,
  })

  // ---------- Mutations ----------
  const {
    mutateAsyncPhases,
    mutateCoursePhaseGraph,
    mutateParticipationDataGraph,
    mutatePhaseDataGraph,
    mutateDeletePhase,
    mutateRenamePhase,
    isMutationError,
  } = useMutations()

  // ---------- Handlers ----------
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const connectHandler = useConnect(edges, nodes, setEdges, setIsModified)
  const dropHandler = useDrop(reactFlowWrapper, setNodes, setIsModified)

  const saveChanges = async () => {
    await handleSave({
      nodes,
      edges,
      coursePhases,
      mutateDeletePhase,
      mutateAsyncPhases,
      mutateRenamePhase,
      mutateCoursePhaseGraph,
      mutateParticipationDataGraph,
      mutatePhaseDataGraph,
      queryClient,
      setIsModified,
    })
  }

  const handleRevert = useCallback(() => {
    removeUnsavedCoursePhases()
    setNodes([])
    setEdges([])
    // reset the course phase
    if (course) {
      setCoursePhases(
        course.coursePhases.map((phase) => ({
          ...phase,
          position: { x: 0, y: 0 },
          restrictedMetaData: [],
          studentReadableData: [],
        })),
      )
    }
    const filteredLayoutedNodes = layoutedInitialNodes.filter(
      (node) => node.id && !node.id.startsWith('no-valid-id'),
    )
    const filteredEdges = layoutedInitialEdges.filter(
      (edge) => edge.id && !edge.id.includes('no-valid-id'),
    )
    setNodes(filteredLayoutedNodes)
    setEdges(filteredEdges)
    setIsModified(false)
  }, [
    removeUnsavedCoursePhases,
    setNodes,
    setEdges,
    course,
    layoutedInitialNodes,
    layoutedInitialEdges,
    setCoursePhases,
  ])

  const handleRetry = useCallback(() => {
    // You could opt for a more targeted retry instead of a full reload.
    window.location.reload()
  }, [])

  const isError = isMutationError

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
          onConnect={connectHandler}
          onDrop={dropHandler}
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
          {DeleteConfirmationComponent}
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
