package coursePhaseParticipationDTO

import "github.com/niclasheun/prompt2.0/coursePhase/resolution/resolutionDTO"

type CoursePhaseParticipationWithResolution struct {
	Participation GetCPPForCoursePhase       `json:"participations"`
	Resolutions   []resolutionDTO.Resolution `json:"resolutions"`
}
