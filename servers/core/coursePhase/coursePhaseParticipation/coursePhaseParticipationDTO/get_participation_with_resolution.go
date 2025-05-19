package coursePhaseParticipationDTO

import "github.com/ls1intum/prompt2/servers/core/coursePhase/resolution/resolutionDTO"

type CoursePhaseParticipationWithResolution struct {
	Participation GetAllCPPsForCoursePhase   `json:"participation"`
	Resolutions   []resolutionDTO.Resolution `json:"resolutions"`
}
