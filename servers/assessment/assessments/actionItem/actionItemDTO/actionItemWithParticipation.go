package actionItemDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type ActionItemWithParticipation struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	ActionItems           []string  `json:"actionItems"`
}

func GetActionItemsFromDBActionItemsWithParticipation(dbActionItems []db.GetAllActionItemsForCoursePhaseCommunicationRow) []ActionItemWithParticipation {
	actionItems := make([]ActionItemWithParticipation, 0, len(dbActionItems))
	for _, a := range dbActionItems {
		actionItems = append(actionItems, MapDBActionItemToActionItemWithParticipationDTO(a.CourseParticipationID, a.ActionItems))
	}
	return actionItems
}

func MapDBActionItemToActionItemWithParticipationDTO(courseParticipationID uuid.UUID, actionItems []string) ActionItemWithParticipation {
	return ActionItemWithParticipation{
		CourseParticipationID: courseParticipationID,
		ActionItems:           actionItems,
	}
}
