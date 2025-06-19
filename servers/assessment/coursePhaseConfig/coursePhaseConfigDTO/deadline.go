package coursePhaseConfigDTO

import "time"

// UpdateDeadlineRequest represents the request to update a course phase deadline
type UpdateDeadlineRequest struct {
	Deadline time.Time `json:"deadline"`
}
