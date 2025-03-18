export const getMetaDataGraphFromEdges = (edges) => {
  return edges.map((edge) => ({
    fromCoursePhaseID: edge.source,
    toCoursePhaseID: edge.target,
    fromCoursePhaseDtoID: edge.sourceHandle?.split('dto-')[1] ?? '',
    toCoursePhaseDtoID: edge.targetHandle?.split('dto-')[1] ?? '', // the dto ID is at the end of the target handle
  }))
}
