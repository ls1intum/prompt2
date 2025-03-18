import { useMutation } from '@tanstack/react-query'
import { postNewCoursePhase } from '@core/network/mutations/postNewCoursePhase'
import { updatePhaseGraph } from '@core/network/mutations/updatePhaseGraph'
import { updateParticipationDataGraph } from '@core/network/mutations/updateParticipationDataGraph'
import { deleteCoursePhase } from '@core/network/mutations/deleteCoursePhase'
import { updateCoursePhase } from '@core/network/mutations/updateCoursePhase'
import { CreateCoursePhase, UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { CoursePhaseGraphUpdate } from '../interfaces/coursePhaseGraphUpdate'
import { MetaDataGraphItem } from '../interfaces/courseMetaGraphItem'
import { useParams } from 'react-router-dom'
import { updatePhaseDataGraph } from '@core/network/mutations/updatePhaseDataGraph'

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

  const { mutate: mutatePhaseDataGraph, isError: isPhaseDataGraphError } = useMutation({
    mutationFn: (updatedGraph: MetaDataGraphItem[]) =>
      updatePhaseDataGraph(courseId ?? '', updatedGraph),
  })

  const { mutate: mutateParticipationDataGraph, isError: isParticipationDataGraphError } =
    useMutation({
      mutationFn: (updatedGraph: MetaDataGraphItem[]) =>
        updateParticipationDataGraph(courseId ?? '', updatedGraph),
      onSuccess: () => {
        // this is the last executed mutation and on this we want to reload!
        window.location.reload()
      },
    })

  const isMutationError =
    isPhaseError ||
    isGraphError ||
    isPhaseDataGraphError ||
    isParticipationDataGraphError ||
    isDeleteError ||
    isRenameError

  return {
    mutateAsyncPhases,
    mutateCoursePhaseGraph,
    mutateParticipationDataGraph,
    mutatePhaseDataGraph,
    mutateDeletePhase,
    mutateRenamePhase,
    isMutationError,
  }
}
