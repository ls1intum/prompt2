import { useCallback, useState } from 'react'
import { DeleteConfirmation } from '../components/DeleteConfirmation'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'

interface DeleteConfirmationReturn {
  deleteDialogIsOpen: boolean
  toBeDeletedComponent: string
  onBeforeDelete: (params: {
    nodes: any[] // TODO fix
    edges: any[]
  }) => Promise<false | { nodes: any[]; edges: any[] }>
  DeleteConfirmationComponent: JSX.Element
}

interface UseDeleteConfirmationProps {
  coursePhases: CoursePhasePosition[]
  setIsModified: (modified: boolean) => void
}

export function useDeleteConfirmation({
  coursePhases,
  setIsModified,
}: UseDeleteConfirmationProps): DeleteConfirmationReturn {
  const [deleteDialogIsOpen, setDeleteDialogOpen] = useState(false)
  const [toBeDeletedComponent, setToBeDeletedComponent] = useState('')
  const [deleteConfirmationResolver, setDeleteConfirmationResolver] =
    useState<(value: boolean) => void>()

  const onBeforeDelete = useCallback(
    async ({ nodes: toBeDeletedNodes, edges: toBeDeletedEdges }) => {
      const hasInitialPhase = toBeDeletedNodes.some(
        (node) =>
          node.id && coursePhases.some((phase) => phase.id === node.id && phase.is_initial_phase),
      )
      if (hasInitialPhase) {
        console.log('Cannot delete initial phase')
        return false
      }

      setDeleteDialogOpen(true)
      setToBeDeletedComponent(toBeDeletedNodes.length > 0 ? 'a Course Phase' : 'an Edge')
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
    [coursePhases, setIsModified],
  )

  const DeleteConfirmationComponent = (
    <DeleteConfirmation
      isOpen={deleteDialogIsOpen}
      setOpen={setDeleteDialogOpen}
      componentName={toBeDeletedComponent}
      onClick={(value: boolean) => {
        if (deleteConfirmationResolver) {
          deleteConfirmationResolver(value)
          setDeleteConfirmationResolver(undefined)
        }
      }}
    />
  )

  return {
    deleteDialogIsOpen,
    toBeDeletedComponent,
    onBeforeDelete,
    DeleteConfirmationComponent,
  }
}
