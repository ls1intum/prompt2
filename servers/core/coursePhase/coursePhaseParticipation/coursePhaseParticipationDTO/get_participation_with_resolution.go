package coursePhaseParticipationDTO

import "github.com/niclasheun/prompt2.0/coursePhase/resolution/resolutionDTO"

type CoursePhaseParticipationWithResolution struct {
	Participation GetAllCPPsForCoursePhase   `json:"participation"`
	Resolutions   []resolutionDTO.Resolution `json:"resolutions"`
}
