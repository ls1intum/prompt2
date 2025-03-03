import { Node, Edge } from '@xyflow/react'
import { CreateCoursePhase, UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { CoursePhaseGraphItem } from '../interfaces/coursePhaseGraphItem'
import { CoursePhaseGraphUpdate } from '../interfaces/coursePhaseGraphUpdate'
import { CoursePhaseWithPosition } from '../interfaces/coursePhaseWithPosition'
import { MetaDataGraphItem } from '../interfaces/courseMetaGraphItem'
import { UseMutateFunction } from '@tanstack/react-query'

interface HandleSaveProps {
  nodes: Node[]
  edges: Edge[]
  coursePhases: CoursePhaseWithPosition[]
  mutateDeletePhase: UseMutateFunction<string | undefined, Error, string, unknown>
  mutateAsyncPhases: (coursePhase: CreateCoursePhase) => Promise<string | undefined>
  mutateRenamePhase: UseMutateFunction<string | undefined, Error, UpdateCoursePhase, unknown>
  mutateCoursePhaseGraph: UseMutateFunction<void, Error, CoursePhaseGraphUpdate, unknown>
  mutateMetaDataGraph: UseMutateFunction<void, Error, MetaDataGraphItem[], unknown>
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
  mutateCoursePhaseGraph,
  mutateMetaDataGraph,
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
      courseID: phase.courseID,
      name: phase.name,
      coursePhaseTypeID: phase.coursePhaseTypeID,
      isInitialPhase: phase.isInitialPhase,
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
  const updatedPhases = coursePhases.filter((phase) => phase.isModified)
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

  // 3.) Update Course Graph Edges with replaced IDs if necessary
  const updatedPersonEdges = edges
    .filter((edge) => {
      return edge.id.startsWith('person-edge-')
    })
    .map((edge) => {
      const newSource = idReplacementMap[edge.source] || edge.source
      const newTarget = idReplacementMap[edge.target] || edge.target
      return { ...edge, source: newSource, target: newTarget }
    })

  const orderArray: CoursePhaseGraphItem[] = updatedPersonEdges.map((edge) => ({
    fromCoursePhaseID: edge.source,
    toCoursePhaseID: edge.target,
  }))

  let initialPhase = coursePhases.find((phase) => phase.isInitialPhase)?.id ?? 'undefined'
  if (initialPhase.startsWith('no-valid-id')) {
    if (idReplacementMap[initialPhase]) {
      initialPhase = idReplacementMap[initialPhase]
    } else {
      console.error('Initial phase has invalid ID')
    }
  }

  const graphUpdate: CoursePhaseGraphUpdate = {
    initialPhase: initialPhase,
    coursePhaseGraph: orderArray,
  }

  try {
    await mutateCoursePhaseGraph(graphUpdate)
  } catch (err) {
    console.error('Error saving course phase', err)
    return err
  }

  // 4.) Update the graph with the new edges
  const updatedMetaDataEdges = edges
    .filter((edge) => {
      return edge.id.startsWith('data-edge-')
    })
    .map((edge) => {
      const newSource = idReplacementMap[edge.source] || edge.source
      const newTarget = idReplacementMap[edge.target] || edge.target
      return { ...edge, source: newSource, target: newTarget }
    })

  const metaDataGraph: MetaDataGraphItem[] = updatedMetaDataEdges.map((edge) => ({
    fromCoursePhaseID: edge.source,
    toCoursePhaseID: edge.target,
    fromCoursePhaseDtoID: edge.sourceHandle?.split('dto-')[1] ?? '',
    toCoursePhaseDtoID: edge.targetHandle?.split('dto-')[1] ?? '', // the dto ID is at the end of the target handle
  }))

  try {
    await mutateMetaDataGraph(metaDataGraph)
    queryClient.invalidateQueries({
      queryKey: ['courses', 'meta_phase_graph', 'course_phase_types', 'course_phase_graph'],
    })
    setIsModified(false)
    // Optionally reload if needed
    // window.location.reload()
  } catch (err) {
    console.error('Error saving course phase', err)
    return err
  }
}
