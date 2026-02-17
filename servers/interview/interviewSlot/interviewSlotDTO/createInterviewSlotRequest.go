package interviewSlotDTO

import "time"

type CreateInterviewSlotRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Location  *string   `json:"location"`
	Capacity  int32     `json:"capacity" binding:"required,min=1"`
}
