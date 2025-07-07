package courseDTO

type CheckCourseCopyableResponse struct {
	Copyable          bool     `json:"copyable"`
	MissingPhaseTypes []string `json:"missingPhaseTypes"`
}
