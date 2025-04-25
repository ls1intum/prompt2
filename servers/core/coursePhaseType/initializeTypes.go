package coursePhaseType

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/utils"
	log "github.com/sirupsen/logrus"
)

func initInterview() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestInterviewPhaseTypeExists(ctx)
	if err != nil {
		log.Error("failed to check if interview phase type exists: ", err)
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
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
			return err
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

		err = qtx.CreateRequiredApplicationAnswers(ctx, newInterviewPhase.ID)
		if err != nil {
			log.Error("failed to create required application answers: ", err)
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
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
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
			return err
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

func initIntroCourseDeveloper() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestIntroCourseDeveloperPhaseTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if intro course developer phase type exists: ", err)
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		baseURL := "{CORE_HOST}/intro-course/api"
		if CoursePhaseTypeServiceSingleton.isDevEnvironment {
			baseURL = "http://localhost:8082/intro-course/api"
		}
		newIntroCourseDeveloper := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "IntroCourseDeveloper",
			InitialPhase: false,
			BaseUrl:      baseURL,
		}
		err = qtx.CreateCoursePhaseType(ctx, newIntroCourseDeveloper)
		if err != nil {
			log.Error("failed to create intro course developer module: ", err)
			return err
		}

		// 2.) Provided Output
		err = qtx.InsertProvidedOutputDevices(ctx, newIntroCourseDeveloper.ID)
		if err != nil {
			log.Error("failed to create required application answers output: ", err)
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

func initDevOpsChallenge() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestDevOpsChallengeTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if dev ops challenge phase type exists: ", err)
		return err
	}
	if !exists {
		// 1.) Create the phase
		newDevOps := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "DevOpsChallenge",
			InitialPhase: false,
			BaseUrl:      "core", // We use core here, as the server does not provide any exported DTOs
		}
		err = CoursePhaseTypeServiceSingleton.queries.CreateCoursePhaseType(ctx, newDevOps)
		if err != nil {
			log.Error("failed to create intro course developer module: ", err)
			return err
		}

		// No requires inputs and no provided outputs

	} else {
		log.Debug("dev ops challenge module already exists")
	}
	return nil
}

func initAssessment() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestAssessmentTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if assessment phase type exists: ", err)
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		baseURL := "{CORE_HOST}/assessment/api"
		if CoursePhaseTypeServiceSingleton.isDevEnvironment {
			baseURL = "http://localhost:8084/assessment/api"
		}

		// create the phase
		newAssessment := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Assessment",
			InitialPhase: false,
			BaseUrl:      baseURL,
		}
		err = qtx.CreateCoursePhaseType(ctx, newAssessment)
		if err != nil {
			log.Error("failed to create assessment module: ", err)
			return err
		}

		// create the required output
		err = qtx.InsertAssessmentScoreOutput(ctx, newAssessment.ID)
		if err != nil {
			log.Error("failed to create required assessment output: ", err)
			return err
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}

	} else {
		log.Debug("assessment module already exists")
	}

	return nil
}

func initTeamAllocation() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestTeamAllocationTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if team allocation phase type exists: ", err)
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		baseURL := "{CORE_HOST}/team-allocation/api"
		if CoursePhaseTypeServiceSingleton.isDevEnvironment {
			baseURL = "http://localhost:8083/team-allocation/api"
		}

		newTeamAllocation := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Team Allocation",
			InitialPhase: false,
			BaseUrl:      baseURL,
		}
		err = qtx.CreateCoursePhaseType(ctx, newTeamAllocation)
		if err != nil {
			log.Error("failed to create assessment module: ", err)
			return err
		}

		// 2.) Create the required input meta data

		// Languages from the application
		err = qtx.CreateRequiredApplicationAnswers(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required application answers: ", err)
			return err
		}

		// devices from the intro course
		err = qtx.CreateRequiredDevices(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required devices: ", err)
			return err
		}

		// score level from the intro course
		err = qtx.InsertAssessmentScoreRequiredInput(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required score level: ", err)
			return err
		}

		// 3.) Provided Output
		err = qtx.InsertTeamAllocationOutput(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required provided team allocation: ", err)
			return err
		}

		err = qtx.InsertTeamOutput(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required provided teams: ", err)
			return err
		}

		// 3.) Commit the transaction
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}

	} else {
		log.Debug("team allocation module already exists")
	}

	return nil
}

func initSelfTeamAllocation() error {
	ctx := context.Background()
	exists, err := CoursePhaseTypeServiceSingleton.queries.TestSelfTeamAllocationTypeExists(ctx)

	if err != nil {
		log.Error("failed to check if self team allocation phase type exists: ", err)
		return err
	}
	if !exists {
		tx, err := CoursePhaseTypeServiceSingleton.conn.Begin(ctx)
		if err != nil {
			return err
		}
		defer utils.DeferRollback(tx, ctx)
		qtx := CoursePhaseTypeServiceSingleton.queries.WithTx(tx)

		// 1.) Create the phase
		baseURL := "{CORE_HOST}/self-team-allocation/api"
		if CoursePhaseTypeServiceSingleton.isDevEnvironment {
			baseURL = "http://localhost:8085/self-team-allocation/api"
		}

		newTeamAllocation := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Self Team Allocation",
			InitialPhase: false,
			BaseUrl:      baseURL,
		}
		err = qtx.CreateCoursePhaseType(ctx, newTeamAllocation)
		if err != nil {
			log.Error("failed to create assessment module: ", err)
			return err
		}

		// 2.) Provided Output
		err = qtx.InsertTeamAllocationOutput(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required provided team allocation: ", err)
			return err
		}

		err = qtx.InsertTeamOutput(ctx, newTeamAllocation.ID)
		if err != nil {
			log.Error("failed to create required provided teams: ", err)
			return err
		}

		// 3.) Commit the transaction
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit transaction: %w", err)
		}

	} else {
		log.Debug("team allocation module already exists")
	}

	return nil
}
