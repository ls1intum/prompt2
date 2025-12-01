package schemaModification

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentSchemas"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

// PrepareSchemaModificationResult contains the result of preparing a schema for modification
type PrepareSchemaModificationResult struct {
	// TargetSchemaID is the schema ID to use for the operation (might be a copy)
	TargetSchemaID uuid.UUID
	// TargetEntityID is the updated entity ID if it was mapped to a new schema (for update/delete)
	TargetEntityID uuid.UUID
	// NeedsCopy indicates if the operation required creating schema copies
	NeedsCopy bool
}

// PrepareSchemaForModification handles all schema copying logic before any modification operation.
// It determines if the schema owner is modifying (copy for consumers) or if a consumer is modifying (copy for themselves).
// For CREATE operations: pass schemaID and set entityID to uuid.Nil
// For UPDATE/DELETE operations: pass both schemaID and entityID
func PrepareSchemaForModification(
	ctx context.Context,
	queries db.Queries,
	schemaID uuid.UUID,
	entityID uuid.UUID,
	coursePhaseID uuid.UUID,
	getCompetencyIDs func(context.Context, uuid.UUID) ([]uuid.UUID, error),
) (*PrepareSchemaModificationResult, error) {
	// Check if this phase owns the schema
	isOwner, err := assessmentSchemas.CheckSchemaOwnership(ctx, schemaID, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to check schema ownership")
		return nil, errors.New("failed to check schema ownership")
	}

	// Check if other phases are using this schema
	consumerPhases, err := assessmentSchemas.GetConsumerPhases(ctx, schemaID, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get consumer phases")
		return nil, errors.New("failed to get consumer phases")
	}

	hasConsumers := len(consumerPhases) > 0

	// SCENARIO 1: Owner modifying with consumers → Copy schema for all consumers with assessment data
	if isOwner && hasConsumers {
		// Get competency IDs to update references
		var competencyIDs []uuid.UUID
		if getCompetencyIDs != nil {
			competencyIDs, err = getCompetencyIDs(ctx, entityID)
			if err != nil {
				return nil, err
			}
		}

		// Copy schema for all consumers and update their assessment/evaluation references
		err = copySchemaForConsumersWithAssessmentData(ctx, queries, schemaID, coursePhaseID, consumerPhases, competencyIDs)
		if err != nil {
			return nil, err
		}

		// Owner keeps the original schema and entity
		return &PrepareSchemaModificationResult{
			TargetSchemaID: schemaID,
			TargetEntityID: entityID,
			NeedsCopy:      true,
		}, nil
	}

	// SCENARIO 2: Consumer modifying shared schema → Copy schema for this consumer only
	if !isOwner {
		newSchemaID, err := copySchemaForConsumer(ctx, queries, schemaID, coursePhaseID)
		if err != nil {
			return nil, err
		}

		// If schema was copied, map the entity to the new schema
		if newSchemaID != schemaID && entityID != uuid.Nil {
			// For competency operations
			corresponding, err := queries.GetCorrespondingCompetencyInNewSchema(ctx, db.GetCorrespondingCompetencyInNewSchemaParams{
				OldCompetencyID: entityID,
				NewSchemaID:     newSchemaID,
			})
			if err == nil {
				// Successfully found competency mapping
				return &PrepareSchemaModificationResult{
					TargetSchemaID: newSchemaID,
					TargetEntityID: corresponding.CompetencyID,
					NeedsCopy:      true,
				}, nil
			}

			// Try category mapping if competency mapping failed
			categoryID, err := queries.GetCorrespondingCategoryInNewSchema(ctx, db.GetCorrespondingCategoryInNewSchemaParams{
				OldCategoryID: entityID,
				NewSchemaID:   newSchemaID,
			})
			if err != nil {
				log.WithError(err).Error("Failed to find corresponding entity in new schema")
				return nil, errors.New("failed to find corresponding entity in new schema")
			}

			return &PrepareSchemaModificationResult{
				TargetSchemaID: newSchemaID,
				TargetEntityID: categoryID,
				NeedsCopy:      true,
			}, nil
		}

		return &PrepareSchemaModificationResult{
			TargetSchemaID: newSchemaID,
			TargetEntityID: entityID,
			NeedsCopy:      newSchemaID != schemaID,
		}, nil
	}

	// SCENARIO 3: No sharing concerns → Direct modification
	return &PrepareSchemaModificationResult{
		TargetSchemaID: schemaID,
		TargetEntityID: entityID,
		NeedsCopy:      false,
	}, nil
}

// CopySchemaForConsumer creates a copy of the schema for a consumer phase if they are using a shared schema
// Returns the new schema ID if a copy was created, or an error
func copySchemaForConsumer(ctx context.Context, queries db.Queries, currentSchemaID uuid.UUID, coursePhaseID uuid.UUID) (uuid.UUID, error) {
	schemaUsed, err := assessmentSchemas.CheckSchemaUsageInOtherPhases(ctx, currentSchemaID, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to check schema usage in other phases")
		return uuid.Nil, errors.New("failed to check schema usage")
	}

	if !schemaUsed {
		// No other phases using this schema, return the current schema ID
		return currentSchemaID, nil
	}

	courseIdentifier, err := utils.GetCourseIdentifierFromPhase(ctx, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get course identifier")
		return uuid.Nil, errors.New("failed to get course identifier")
	}

	newSchema, err := assessmentSchemas.CopyAssessmentSchema(ctx, coursePhaseID, courseIdentifier)
	if err != nil {
		log.WithError(err).Error("Failed to copy assessment schema")
		return uuid.Nil, errors.New("failed to copy assessment schema")
	}

	err = coursePhaseConfig.UpdateCoursePhaseConfigAssessmentSchema(ctx, coursePhaseID, newSchema.ID)
	if err != nil {
		log.WithError(err).Error("Failed to update course phase config with new schema")
		return uuid.Nil, errors.New("failed to update course phase config")
	}

	return newSchema.ID, nil
}

func copySchemaForConsumersWithAssessmentData(ctx context.Context, queries db.Queries, templateSchemaID uuid.UUID, ownerPhaseID uuid.UUID, consumerPhases []uuid.UUID, competencyIDs []uuid.UUID) error {
	for _, phaseID := range consumerPhases {
		courseIdentifier, err := utils.GetCourseIdentifierFromPhase(ctx, phaseID)
		if err != nil {
			log.WithError(err).Error("Failed to get course identifier")
			return errors.New("failed to get course identifier")
		}

		copiedSchema, err := assessmentSchemas.CopyAssessmentSchema(ctx, phaseID, courseIdentifier)
		if err != nil {
			log.WithError(err).Error("Failed to copy assessment schema")
			return errors.New("failed to copy assessment schema")
		}

		err = coursePhaseConfig.UpdateCoursePhaseConfigAssessmentSchema(ctx, phaseID, copiedSchema.ID)
		if err != nil {
			log.WithError(err).Error("Failed to update course phase config")
			return errors.New("failed to update course phase config")
		}

		hasAssessmentData, err := assessmentSchemas.CheckPhaseHasAssessmentData(ctx, phaseID, templateSchemaID)
		if err != nil {
			log.WithError(err).Error("Failed to check if phase has assessment data")
			return errors.New("failed to check if phase has assessment data")
		}

		if !hasAssessmentData {
			continue // No need to copy if no data exists
		}

		for _, competencyID := range competencyIDs {
			newCompMapping, err := queries.GetCorrespondingCompetencyInNewSchema(ctx, db.GetCorrespondingCompetencyInNewSchemaParams{
				OldCompetencyID: competencyID,
				NewSchemaID:     copiedSchema.ID,
			})
			if err != nil {
				log.WithError(err).Warn("Failed to find corresponding competency in new schema, skipping")
				continue
			}

			// Update assessment and evaluation competency references
			err = assessmentSchemas.UpdateAssessmentCompetencies(ctx, phaseID, competencyID, newCompMapping.CompetencyID)
			if err != nil {
				log.WithError(err).Error("Failed to update competency references")
				return errors.New("failed to update competency references")
			}
		}
	}

	return nil
}
