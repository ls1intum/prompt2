package competencyDTO

type UpdateCompetencyRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	Novice       string `json:"novice"`
	Intermediate string `json:"intermediate"`
	Advanced     string `json:"advanced"`
	Expert       string `json:"expert"`
	Weight       int32  `json:"weight"`
}
