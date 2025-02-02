package coursePhaseType

import (
	"context"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhaseType/coursePhaseTypeDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

func initInterview(queries db.Queries) {
	ctx := context.Background()
	exists, err := queries.TestInterviewPhaseTypeExists(ctx)
	if err != nil {
		log.Error("failed to check if interview phase type exists: ", err)
	}
	if !exists {
		// create the interview module
		requiredInputMetaData := coursePhaseTypeDTO.MetaRequirements{
			{Name: "applicationScore", Type: "integer", AlternativeNames: []string{}},
			{Name: "applicationAnswers", Type: "[]", AlternativeNames: []string{}},
		}

		providedOutputMetaData := coursePhaseTypeDTO.MetaRequirements{
			{Name: "interviewScore", Type: "integer", AlternativeNames: []string{}},
		}

		requiredInputMetaDataBytes, err := requiredInputMetaData.GetDBModel()
		if err != nil {
			log.Error("failed to parse required input meta data")
			return
		}

		providedOutputMetaDataBytes, err := providedOutputMetaData.GetDBModel()
		if err != nil {
			log.Error("failed to parse provided output meta data")
			return
		}

		newInterviewPhaseType := db.CreateCoursePhaseTypeParams{
			ID:                     uuid.New(),
			Name:                   "Interview",
			InitialPhase:           false,
			RequiredInputMetaData:  requiredInputMetaDataBytes,
			ProvidedOutputMetaData: providedOutputMetaDataBytes,
		}
		err = queries.CreateCoursePhaseType(ctx, newInterviewPhaseType)
		if err != nil {
			log.Error("failed to create interview module: ", err)
		}
	} else {
		log.Debug("interview module already exists")
	}
}

func initMatching(queries db.Queries) {
	ctx := context.Background()
	exists, err := queries.TestMatchingPhaseTypeExists(ctx)
	if err != nil {
		log.Error("failed to check if matching phase type exists: ", err)
	}
	if !exists {
		// create the interview module
		requiredInputMetaData := coursePhaseTypeDTO.MetaRequirements{
			{Name: "applicationScore", Type: "integer", AlternativeNames: []string{"interviewScore"}},
		}

		providedOutputMetaData := coursePhaseTypeDTO.MetaRequirements{}

		requiredInputMetaDataBytes, err := requiredInputMetaData.GetDBModel()
		if err != nil {
			log.Error("failed to parse required input meta data")
			return
		}

		providedOutputMetaDataBytes, err := providedOutputMetaData.GetDBModel()
		if err != nil {
			log.Error("failed to parse provided output meta data")
			return
		}

		newMatchingPhase := db.CreateCoursePhaseTypeParams{
			ID:                     uuid.New(),
			Name:                   "Matching",
			InitialPhase:           false,
			RequiredInputMetaData:  requiredInputMetaDataBytes,
			ProvidedOutputMetaData: providedOutputMetaDataBytes,
		}
		err = queries.CreateCoursePhaseType(ctx, newMatchingPhase)
		if err != nil {
			log.Error("failed to create matching module: ", err)
		}
	} else {
		log.Debug("matching module already exists")
	}
}
