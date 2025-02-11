package coursePhaseParticipationDTO

type CoursePhaseParticipationsWithResolutions struct {
	Participations []GetAllCPPsForCoursePhase `json:"participations"`
	Resolution     []Resolution               `json:"resolution"`
}
