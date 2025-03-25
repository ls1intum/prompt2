package survey

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/survey/surveyDTO"
	log "github.com/sirupsen/logrus"
)

// SurveyService encapsulates survey-related operations.
type SurveyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

// SurveyServiceSingleton provides a global instance.
var SurveyServiceSingleton *SurveyService

// GetAvailableSurveyData returns available teams and skills if the survey has started.
func GetAvailableSurveyData(ctx context.Context, coursePhaseID uuid.UUID) (surveyDTO.SurveyData, error) {
	// Get survey timeframe
	timeframe, err := SurveyServiceSingleton.queries.GetSurveyTimeframe(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get survey timeframe: ", err)
		return surveyDTO.SurveyData{}, errors.New("could not get survey timeframe")
	}
	// Ensure survey has started.
	if time.Now().Before(timeframe.SurveyStart.Time) {
		return surveyDTO.SurveyData{}, errors.New("survey has not started yet")
	}
	// Get teams and skills
	teams, err := SurveyServiceSingleton.queries.GetTeamsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get teams: ", err)
		return surveyDTO.SurveyData{}, errors.New("could not get teams")
	}
	skills, err := SurveyServiceSingleton.queries.GetSkillsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get skills: ", err)
		return surveyDTO.SurveyData{}, errors.New("could not get skills")
	}
	return surveyDTO.GetSurveyDataDTOFromDBModels(teams, skills), nil
}

// GetStudentSurveyResponses returns any submitted survey answers for the student.
func GetStudentSurveyResponses(ctx context.Context, courseParticipationID uuid.UUID) (surveyDTO.StudentSurveyResponse, error) {
	teamResponses, err := SurveyServiceSingleton.queries.GetStudentTeamPreferences(ctx, courseParticipationID)
	if err != nil {
		log.Error("could not get team preferences: ", err)
		return surveyDTO.StudentSurveyResponse{}, errors.New("could not get team preferences")
	}
	skillResponses, err := SurveyServiceSingleton.queries.GetStudentSkillResponses(ctx, courseParticipationID)
	if err != nil {
		log.Error("could not get skill responses: ", err)
		return surveyDTO.StudentSurveyResponse{}, errors.New("could not get skill responses")
	}
	return surveyDTO.GetStudentSurveyResponseDTOFromDBModels(teamResponses, skillResponses), nil
}

// SubmitSurveyResponses saves or overwrites the student's survey answers.
// It only accepts submissions before the survey_deadline.
func SubmitSurveyResponses(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID, submission surveyDTO.StudentSurveyResponse) error {
	// Get survey timeframe to check deadline.
	timeframe, err := SurveyServiceSingleton.queries.GetSurveyTimeframe(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get survey timeframe: ", err)
		return errors.New("could not get survey timeframe")
	}
	if time.Now().Before(timeframe.SurveyStart.Time) {
		return errors.New("survey has not started yet")
	}
	if time.Now().After(timeframe.SurveyDeadline.Time) {
		return errors.New("survey deadline has passed")
	}

	// Begin transaction.
	tx, err := SurveyServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)
	qtx := SurveyServiceSingleton.queries.WithTx(tx)

	// Delete any existing responses for this student.
	if err := qtx.DeleteStudentTeamPreferences(ctx, courseParticipationID); err != nil {
		log.Error("failed to delete existing team preferences: ", err)
		return errors.New("failed to delete existing team preferences")
	}
	if err := qtx.DeleteStudentSkillResponses(ctx, courseParticipationID); err != nil {
		log.Error("failed to delete existing skill responses: ", err)
		return errors.New("failed to delete existing skill responses")
	}

	// Insert new team preferences.
	for _, tp := range submission.TeamPreferences {
		err := qtx.InsertStudentTeamPreference(ctx, db.InsertStudentTeamPreferenceParams{
			CourseParticipationID: courseParticipationID,
			TeamID:                tp.TeamID,
			Preference:            tp.Preference,
		})
		if err != nil {
			log.Error("failed to insert team preference: ", err)
			return errors.New("failed to insert team preference")
		}
	}

	// Insert new skill responses.
	for _, sr := range submission.SkillResponses {
		err := qtx.InsertStudentSkillResponse(ctx, db.InsertStudentSkillResponseParams{
			CourseParticipationID: courseParticipationID,
			SkillID:               sr.SkillID,
			Rating:                sr.Rating,
		})
		if err != nil {
			log.Error("failed to insert skill response: ", err)
			return errors.New("failed to insert skill response")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("failed to commit transaction: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// SetSurveyTimeframe sets (or updates) the survey start and deadline for a course phase.
// It returns an error if surveyStart is not before surveyDeadline.
func SetSurveyTimeframe(ctx context.Context, coursePhaseID uuid.UUID, surveyStart, surveyDeadline time.Time) error {
	if !surveyStart.Before(surveyDeadline) {
		return errors.New("survey start must be before survey deadline")
	}

	var startTimestamp, deadlineTimestamp pgtype.Timestamp
	startTimestamp = pgtype.Timestamp{Time: surveyStart, Valid: true}
	deadlineTimestamp = pgtype.Timestamp{Time: surveyDeadline, Valid: true}

	err := SurveyServiceSingleton.queries.SetSurveyTimeframe(ctx, db.SetSurveyTimeframeParams{
		CoursePhaseID:  coursePhaseID,
		SurveyStart:    startTimestamp,
		SurveyDeadline: deadlineTimestamp,
	})
	if err != nil {
		log.Error("failed to set survey timeframe: ", err)
		return errors.New("failed to set survey timeframe")
	}
	return nil
}

func GetSurveyTimeframe(ctx context.Context, coursePhaseID uuid.UUID) (surveyDTO.SurveyTimeframe, error) {
	timeframe, err := SurveyServiceSingleton.queries.GetSurveyTimeframe(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		return surveyDTO.SurveyTimeframe{TimeframeSet: false}, nil
	} else if err != nil {
		log.Error("could not get survey timeframe: ", err)
		return surveyDTO.SurveyTimeframe{}, errors.New("could not get survey timeframe")
	}
	return surveyDTO.GetSurveyTimeframeDTOFromDBModel(timeframe), nil
}
