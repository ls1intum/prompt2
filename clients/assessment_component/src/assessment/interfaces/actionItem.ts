export interface ActionItem {
  id: string // UUID
  coursePhaseId: string // UUID
  courseParticipationId: string // UUID
  action: string
  createdAt: Date
  author: string
}

export interface CreateActionItemRequest {
  coursePhaseId: string // UUID
  courseParticipationId: string // UUID
  action: string
  author: string
}

export interface UpdateActionItemRequest {
  id: string // UUID
  coursePhaseId: string // UUID
  courseParticipationId: string // UUID
  action: string
  author: string
}
