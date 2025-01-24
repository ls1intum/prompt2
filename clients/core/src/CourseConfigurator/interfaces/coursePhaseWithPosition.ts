export interface CoursePhaseWithPosition {
  id?: string
  courseID: string
  name: string
  metaData: Array<JSON>
  isInitialPhase: boolean
  coursePhaseTypeID: string
  position: { x: number; y: number }
  isModified?: boolean
}
