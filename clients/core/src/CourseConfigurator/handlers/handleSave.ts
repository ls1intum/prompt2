import { Node, Edge } from '@xyflow/react'
import { CreateCoursePhase } from '@/interfaces/course_phase'
import { CoursePhaseGraphItem, CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'
import { UseMutateFunction } from '@tanstack/react-query'

interface HandleSaveProps {
  nodes: Node[]
  edges: Edge[]
  coursePhases: any[]
  mutateDeletePhase: UseMutateFunction<string | undefined, Error, string, unknown>
  mutateAsyncPhases: (coursePhase: CreateCoursePhase) => Promise<string | undefined>
  mutateGraph: UseMutateFunction<string | undefined, Error, CoursePhaseGraphUpdate, unknown>
  queryClient: any
  setIsModified: (val: boolean) => void
}

export async function handleSave({
  nodes,
  edges,
  coursePhases,
  mutateDeletePhase,
  mutateAsyncPhases,
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

  // 2.) Update edges with replaced IDs if necessary
  const updatedEdges = edges.map((edge) => {
    const newSource = idReplacementMap[edge.source] || edge.source
    const newTarget = idReplacementMap[edge.target] || edge.target
    return { ...edge, source: newSource, target: newTarget }
  })

  const orderArray: CoursePhaseGraphItem[] = updatedEdges.map((edge) => ({
    from_course_phase_id: edge.source,
    to_course_phase_id: edge.target,
  }))

  const initialPhase = coursePhases.find((phase) => phase.is_initial_phase)?.id ?? 'undefined'

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
