package courseDTO

import "github.com/google/uuid"

type MetaDataGraphItem struct {
	FromCoursePhaseID    uuid.UUID `json:"fromCoursePhaseID"`
	ToCoursePhaseID      uuid.UUID `json:"toCoursePhaseID"`
	FromCoursePhaseDtoID uuid.UUID `json:"fromCoursePhaseDtoID"`
	ToCoursePhaseDtoID   uuid.UUID `json:"toCoursePhaseDtoID"`
}
