package coursePhaseParticipationDTO

type CoursePhaseParticipationsWithResolutions struct {
	Participations []GetAllCPPsForCoursePhase `json:"participations"`
	Resolutions    []Resolution               `json:"resolutions"`
}
