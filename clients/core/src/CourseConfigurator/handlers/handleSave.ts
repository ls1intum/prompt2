import { Node, Edge } from '@xyflow/react'
import { CreateCoursePhase, UpdateCoursePhase } from '@/interfaces/course_phase'
import { CoursePhaseGraphItem, CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'
import { UseMutateFunction } from '@tanstack/react-query'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'

interface HandleSaveProps {
  nodes: Node[]
  edges: Edge[]
  coursePhases: CoursePhasePosition[]
  mutateDeletePhase: UseMutateFunction<string | undefined, Error, string, unknown>
  mutateAsyncPhases: (coursePhase: CreateCoursePhase) => Promise<string | undefined>
  mutateRenamePhase: UseMutateFunction<string | undefined, Error, UpdateCoursePhase, unknown>
  mutateGraph: UseMutateFunction<string | undefined, Error, CoursePhaseGraphUpdate, unknown>
  queryClient: any
  setIsModified: (val: boolean) => void
}

// TODO: move this to the server side to enable transaction control!
export async function handleSave({
  nodes,
  edges,
  coursePhases,
  mutateDeletePhase,
  mutateAsyncPhases,
  mutateRenamePhase,
  mutateGraph,
  queryClient,
  setIsModified,
}: HandleSaveProps) {
  const idReplacementMap: { [key: string]: string } = {}

  // 0.) Remove nodes that no longer exist in the graph
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

  // 1.) Add new phases
  const newPhases = coursePhases.filter((phase) => !phase.id || phase.id.startsWith('no-valid-id'))
  for (const phase of newPhases) {
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

  // 2.) Update the names of the phases if any
  const updatedPhases = coursePhases.filter((phase) => phase.is_modified)
  for (const updatedPhase of updatedPhases) {
    try {
      await mutateRenamePhase({
        id: updatedPhase.id as string,
        name: updatedPhase.name,
      })
    } catch (err) {
      console.error('Error saving course phase', err)
      return
    }
  }

  // 3.) Update edges with replaced IDs if necessary
  const updatedEdges = edges.map((edge) => {
    const newSource = idReplacementMap[edge.source] || edge.source
    const newTarget = idReplacementMap[edge.target] || edge.target
    return { ...edge, source: newSource, target: newTarget }
  })

  const orderArray: CoursePhaseGraphItem[] = updatedEdges.map((edge) => ({
    from_course_phase_id: edge.source,
    to_course_phase_id: edge.target,
  }))

  let initialPhase = coursePhases.find((phase) => phase.is_initial_phase)?.id ?? 'undefined'
  if (initialPhase.startsWith('no-valid-id')) {
    if (idReplacementMap[initialPhase]) {
      initialPhase = idReplacementMap[initialPhase]
    } else {
      console.error('Initial phase has invalid ID')
    }
  }

  const graphUpdate: CoursePhaseGraphUpdate = {
    initial_phase: initialPhase,
    course_phase_graph: orderArray,
  }

  try {
    await mutateGraph(graphUpdate)
    queryClient.invalidateQueries({
      queryKey: ['courses', 'course_phase_types', 'course_phase_graph'],
    })
    setIsModified(false)
    // Optionally reload if needed
    // window.location.reload()
  } catch (err) {
    console.error('Error saving course phase', err)
    return err
  }
}
