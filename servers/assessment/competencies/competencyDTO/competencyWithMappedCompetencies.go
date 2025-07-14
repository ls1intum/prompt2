package competencyDTO

type CompetencyWithMappedCompetencies struct {
	Competency
	MappedCompetencies []string `json:"mappedCompetencies"` // List of competency IDs that map to this competency
}
