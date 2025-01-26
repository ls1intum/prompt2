import { useMutation } from '@tanstack/react-query'
import { postNewCoursePhase } from '@core/network/mutations/postNewCoursePhase'
import { updatePhaseGraph } from '@core/network/mutations/updatePhaseGraph'
import { updateMetaDataGraph } from '@core/network/mutations/updateMetaDataGraph'
import { deleteCoursePhase } from '@core/network/mutations/deleteCoursePhase'
import { updateCoursePhase } from '@core/network/mutations/updateCoursePhase'
import { CreateCoursePhase, UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { CoursePhaseGraphUpdate } from '../interfaces/coursePhaseGraphUpdate'
import { MetaDataGraphItem } from '../interfaces/courseMetaGraphItem'
import { useParams } from 'react-router-dom'

export function useMutations() {
  const { courseId } = useParams<{ courseId: string }>()
  const { mutateAsync: mutateAsyncPhases, isError: isPhaseError } = useMutation({
    mutationFn: (coursePhase: CreateCoursePhase) => postNewCoursePhase(coursePhase),
  })

  const { mutate: mutateCoursePhaseGraph, isError: isGraphError } = useMutation({
    mutationFn: (update: CoursePhaseGraphUpdate) => updatePhaseGraph(courseId ?? '', update),
  })

  const { mutate: mutateDeletePhase, isError: isDeleteError } = useMutation({
    mutationFn: (coursePhaseId: string) => deleteCoursePhase(coursePhaseId),
  })

  const { mutate: mutateRenamePhase, isError: isRenameError } = useMutation({
    mutationFn: (coursePhase: UpdateCoursePhase) => updateCoursePhase(coursePhase),
  })

  const { mutate: mutateMetaDataGraph, isError: isMetaDataGraphError } = useMutation({
    mutationFn: (updatedGraph: MetaDataGraphItem[]) =>
      updateMetaDataGraph(courseId ?? '', updatedGraph),
    onSuccess: () => {
      // this is the last executed mutation and on this we want to reload!
      window.location.reload()
    },
  })

  const isMutationError =
    isPhaseError || isGraphError || isMetaDataGraphError || isDeleteError || isRenameError

  return {
    mutateAsyncPhases,
    mutateCoursePhaseGraph,
    mutateMetaDataGraph,
    mutateDeletePhase,
    mutateRenamePhase,
    isMutationError,
  }
}
