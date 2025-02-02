package courseDTO

import "github.com/google/uuid"

type CoursePhaseOrderRequest struct {
	OrderedPhases []uuid.UUID `json:"orderedPhases"`
}

type CoursePhaseOrderResponse struct {
	OrderedPhases    []uuid.UUID `json:"orderedPhases"`
	NotOrderedPhases []uuid.UUID `json:"notOrderedPhases"`
}
