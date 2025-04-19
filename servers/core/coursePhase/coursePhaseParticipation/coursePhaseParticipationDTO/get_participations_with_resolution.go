package coursePhaseParticipationDTO

import "github.com/niclasheun/prompt2.0/coursePhase/resolution"

type CoursePhaseParticipationsWithResolutions struct {
	Participations []GetAllCPPsForCoursePhase `json:"participations"`
	Resolutions    []resolution.Resolution    `json:"resolutions"`
}
