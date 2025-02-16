package coursePhaseType

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

func initInterview() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestInterviewPhaseTypeExists(ctx)
	if err != nil {
		log.Error("failed to check if interview phase type exists: ", err)
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer tx.Rollback(ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		newInterviewPhase := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Interview",
			InitialPhase: false,
			BaseUrl:      "core",
		}
		err = qtx.CreateCoursePhaseType(ctx, newInterviewPhase)
		if err != nil {
			log.Error("failed to create matching module: ", err)
		}

		// 2.) Create the required input meta data
		scoreSpecificationJson := meta.MetaData{}
		scoreSpecificationJson["type"] = "integer"
		scoreSpecificationBytes, err := scoreSpecificationJson.GetDBModel()
		if err != nil {
			log.Error("failed to parse score specification")
			return err
		}

		newRequiredScoreInput := db.CreateCoursePhaseTypeRequiredInputParams{
			ID:                uuid.New(),
			CoursePhaseTypeID: newInterviewPhase.ID,
			DtoName:           "score",
			Specification:     scoreSpecificationBytes,
		}
		err = qtx.CreateCoursePhaseTypeRequiredInput(ctx, newRequiredScoreInput)
		if err != nil {
			log.Error("failed to create required score input: ", err)
			return err
		}

		// 3.) Specify the provided output meta data
		newProvidedOutput := db.CreateCoursePhaseTypeProvidedOutputParams{
			ID:                uuid.New(),
			CoursePhaseTypeID: newInterviewPhase.ID,
			DtoName:           "score",
			Specification:     scoreSpecificationBytes,
			VersionNumber:     1,
			EndpointPath:      "core",
		}
		err = qtx.CreateCoursePhaseTypeProvidedOutput(ctx, newProvidedOutput)
		if err != nil {
			log.Error("failed to create required score input: ", err)
			return err
		}

		// 4.) Commit the transaction
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}
	} else {
		log.Debug("interview module already exists")
	}
	return nil
}

func initMatching() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestMatchingPhaseTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if matching phase type exists: ", err)
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer tx.Rollback(ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		newMatchingPhase := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Matching",
			InitialPhase: false,
			BaseUrl:      "core",
		}
		err = qtx.CreateCoursePhaseType(ctx, newMatchingPhase)
		if err != nil {
			log.Error("failed to create matching module: ", err)
		}

		// 2.) Create the required input meta data
		scoreSpecificationJson := meta.MetaData{}
		scoreSpecificationJson["type"] = "integer"
		scoreSpecificationBytes, err := scoreSpecificationJson.GetDBModel()
		if err != nil {
			log.Error("failed to parse score specification")
			return err
		}

		newRequiredScoreInput := db.CreateCoursePhaseTypeRequiredInputParams{
			ID:                uuid.New(),
			CoursePhaseTypeID: newMatchingPhase.ID,
			DtoName:           "score",
			Specification:     scoreSpecificationBytes,
		}
		err = qtx.CreateCoursePhaseTypeRequiredInput(ctx, newRequiredScoreInput)
		if err != nil {
			log.Error("failed to create required score input: ", err)
			return err
		}

		// 3.) Commit the transaction
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}

	} else {
		log.Debug("matching module already exists")
	}

	return nil
}
