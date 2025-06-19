package coursePhaseConfigDTO

import "time"

type UpdateDeadlineRequest struct {
	Deadline time.Time `json:"deadline"`
}
