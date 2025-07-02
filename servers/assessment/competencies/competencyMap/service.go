package competencyMap

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyMap/competencyMapDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CompetencyMapService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CompetencyMapServiceSingleton *CompetencyMapService

func CreateCompetencyMapping(ctx context.Context, req competencyMapDTO.CreateCompetencyMappingRequest) error {
	err := CompetencyMapServiceSingleton.queries.CreateCompetencyMap(ctx, db.CreateCompetencyMapParams{
		FromCompetencyID: req.FromCompetencyID,
		ToCompetencyID:   req.ToCompetencyID,
	})
	if err != nil {
		log.Error("could not create competency mapping: ", err)
		return errors.New("could not create competency mapping")
	}
	return nil
}

func DeleteCompetencyMapping(ctx context.Context, req competencyMapDTO.DeleteCompetencyMappingRequest) error {
	err := CompetencyMapServiceSingleton.queries.DeleteCompetencyMap(ctx, db.DeleteCompetencyMapParams{
		FromCompetencyID: req.FromCompetencyID,
		ToCompetencyID:   req.ToCompetencyID,
	})
	if err != nil {
		log.Error("could not delete competency mapping: ", err)
		return errors.New("could not delete competency mapping")
	}
	return nil
}

func GetCompetencyMappings(ctx context.Context, fromCompetencyID uuid.UUID) ([]db.CompetencyMap, error) {
	mappings, err := CompetencyMapServiceSingleton.queries.GetCompetencyMappings(ctx, fromCompetencyID)
	if err != nil {
		log.Error("could not get competency mappings: ", err)
		return nil, errors.New("could not get competency mappings")
	}
	return mappings, nil
}

func GetAllCompetencyMappings(ctx context.Context) ([]db.CompetencyMap, error) {
	mappings, err := CompetencyMapServiceSingleton.queries.GetAllCompetencyMappings(ctx)
	if err != nil {
		log.Error("could not get all competency mappings: ", err)
		return nil, errors.New("could not get all competency mappings")
	}
	return mappings, nil
}

func GetReverseCompetencyMappings(ctx context.Context, toCompetencyID uuid.UUID) ([]db.CompetencyMap, error) {
	mappings, err := CompetencyMapServiceSingleton.queries.GetReverseCompetencyMappings(ctx, toCompetencyID)
	if err != nil {
		log.Error("could not get reverse competency mappings: ", err)
		return nil, errors.New("could not get reverse competency mappings")
	}
	return mappings, nil
}

func GetEvaluationsByMappedCompetency(ctx context.Context, fromCompetencyID uuid.UUID) ([]db.Evaluation, error) {
	evaluations, err := CompetencyMapServiceSingleton.queries.GetEvaluationsByMappedCompetency(ctx, fromCompetencyID)
	if err != nil {
		log.Error("could not get evaluations by mapped competency: ", err)
		return nil, errors.New("could not get evaluations by mapped competency")
	}
	return evaluations, nil
}
