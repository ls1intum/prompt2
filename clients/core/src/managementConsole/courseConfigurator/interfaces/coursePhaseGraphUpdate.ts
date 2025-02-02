import { CoursePhaseGraphItem } from './coursePhaseGraphItem'

export interface CoursePhaseGraphUpdate {
  initialPhase: string
  coursePhaseGraph: CoursePhaseGraphItem[]
}
