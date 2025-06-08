export interface ActionItem {
  id: string // UUID
  coursePhaseId: string // UUID
  courseParticipationId: string // UUID
  action: string
  createdAt: Date
  author: string
}
