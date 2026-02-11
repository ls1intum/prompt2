package allocationDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
)

type AllocationWithParticipation struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	TeamAllocation        uuid.UUID `json:"teamAllocation"`
}

// GetAllocationsFromDBModels converts a slice of db.Assignment to DTOs.
func GetAllocationsFromDBModels(dbAssignments []db.Assignment) []AllocationWithParticipation {
	allocations := make([]AllocationWithParticipation, 0, len(dbAssignments))
	for _, assignment := range dbAssignments {
		allocations = append(allocations, AllocationWithParticipation{
			CourseParticipationID: assignment.CourseParticipationID,
			TeamAllocation:        assignment.TeamID,
		})
	}
	return allocations
}
