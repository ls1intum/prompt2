package competencyMapDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CompetencyMapping struct {
	FromCompetencyID uuid.UUID `json:"fromCompetencyId"`
	ToCompetencyID   uuid.UUID `json:"toCompetencyId"`
}

type CreateCompetencyMappingRequest struct {
	FromCompetencyID uuid.UUID `json:"fromCompetencyId" binding:"required"`
	ToCompetencyID   uuid.UUID `json:"toCompetencyId" binding:"required"`
}

type DeleteCompetencyMappingRequest struct {
	FromCompetencyID uuid.UUID `json:"fromCompetencyId" binding:"required"`
	ToCompetencyID   uuid.UUID `json:"toCompetencyId" binding:"required"`
}

func GetCompetencyMappingFromDBModel(dbModel db.CompetencyMap) CompetencyMapping {
	return CompetencyMapping{
		FromCompetencyID: dbModel.FromCompetencyID,
		ToCompetencyID:   dbModel.ToCompetencyID,
	}
}

func GetCompetencyMappingsFromDBModels(dbModels []db.CompetencyMap) []CompetencyMapping {
	var mappings []CompetencyMapping
	for _, dbModel := range dbModels {
		mappings = append(mappings, GetCompetencyMappingFromDBModel(dbModel))
	}
	return mappings
}
