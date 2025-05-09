package coursePhaseParticipationDTO

import "github.com/niclasheun/prompt2.0/coursePhase/resolution/resolutionDTO"

type CoursePhaseParticipationsWithResolutions struct {
	Participations []GetAllCPPsForCoursePhase `json:"participations"`
	Resolutions    []resolutionDTO.Resolution `json:"resolutions"`
}
