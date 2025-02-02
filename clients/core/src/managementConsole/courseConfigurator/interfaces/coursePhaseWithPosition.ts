export interface CoursePhaseWithPosition {
  id?: string
  courseID: string
  name: string
  restrictedMetaData: Array<JSON>
  studentReadableData: Array<JSON>
  isInitialPhase: boolean
  coursePhaseTypeID: string
  position: { x: number; y: number }
  isModified?: boolean
}
