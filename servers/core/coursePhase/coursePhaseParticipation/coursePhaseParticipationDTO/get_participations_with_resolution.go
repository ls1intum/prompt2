package coursePhaseParticipationDTO

import "github.com/ls1intum/prompt2/servers/core/coursePhase/resolution/resolutionDTO"

type CoursePhaseParticipationsWithResolutions struct {
	Participations []GetAllCPPsForCoursePhase `json:"participations"`
	Resolutions    []resolutionDTO.Resolution `json:"resolutions"`
}
