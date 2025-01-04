package applicationDTO

type AdditionalScore struct {
	Name            string            `json:"name"`
	Threshold       float32           `json:"threshold"`
	ThresholdActive bool              `json:"threshold_active"`
	Scores          []IndividualScore `json:"scores"`
}

type IndividualScore struct {
	CoursePhaseParticipationID string  `json:"course_phase_participation_id"`
	Score                      float32 `json:"score"`
}
