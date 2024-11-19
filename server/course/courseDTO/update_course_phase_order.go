package courseDTO

import "github.com/google/uuid"

type CoursePhaseOrderRequest struct {
	OrderedPhases []uuid.UUID `json:"ordered_phases"`
}

type CoursePhaseOrderResponse struct {
	OrderedPhases    []uuid.UUID `json:"ordered_phases"`
	NotOrderedPhases []uuid.UUID `json:"not_ordered_phases"`
}
