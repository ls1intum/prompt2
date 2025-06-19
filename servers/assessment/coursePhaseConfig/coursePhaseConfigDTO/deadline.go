package coursePhaseConfigDTO

import "time"

// UpdateDeadlineRequest represents the request to update a course phase deadline
type UpdateDeadlineRequest struct {
	Deadline time.Time `json:"deadline"`
}

// UpdateDeadlineResponse represents the response after updating a course phase deadline
type UpdateDeadlineResponse struct {
	Message string `json:"message"`
}
