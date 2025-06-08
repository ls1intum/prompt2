export interface ActionItem {
  id: string // UUID
  coursePhaseID: string // UUID
  courseParticipationID: string // UUID
  action: string
  createdAt: Date
  author: string
}

export interface CreateActionItemRequest {
  coursePhaseID: string // UUID
  courseParticipationID: string // UUID
  action: string
  author: string
}

export interface UpdateActionItemRequest {
  id: string // UUID
  coursePhaseID: string // UUID
  courseParticipationID: string // UUID
  action: string
  author: string
}
