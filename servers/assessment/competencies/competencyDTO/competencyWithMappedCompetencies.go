package competencyDTO

type CompetencyWithMappedCompetencies struct {
	Competency
	MappedFromCompetencies []string `json:"mappedFromCompetencies"` // List of competency IDs that map to this competency
}
