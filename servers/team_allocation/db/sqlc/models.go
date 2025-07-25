// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0

package db

import (
	"database/sql/driver"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type SkillLevel string

const (
	SkillLevelNovice       SkillLevel = "novice"
	SkillLevelIntermediate SkillLevel = "intermediate"
	SkillLevelAdvanced     SkillLevel = "advanced"
	SkillLevelExpert       SkillLevel = "expert"
)

func (e *SkillLevel) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = SkillLevel(s)
	case string:
		*e = SkillLevel(s)
	default:
		return fmt.Errorf("unsupported scan type for SkillLevel: %T", src)
	}
	return nil
}

type NullSkillLevel struct {
	SkillLevel SkillLevel `json:"skill_level"`
	Valid      bool       `json:"valid"` // Valid is true if SkillLevel is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullSkillLevel) Scan(value interface{}) error {
	if value == nil {
		ns.SkillLevel, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.SkillLevel.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullSkillLevel) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.SkillLevel), nil
}

type Allocation struct {
	ID                    uuid.UUID        `json:"id"`
	CourseParticipationID uuid.UUID        `json:"course_participation_id"`
	TeamID                uuid.UUID        `json:"team_id"`
	CoursePhaseID         uuid.UUID        `json:"course_phase_id"`
	CreatedAt             pgtype.Timestamp `json:"created_at"`
	UpdatedAt             pgtype.Timestamp `json:"updated_at"`
	StudentFirstName      string           `json:"student_first_name"`
	StudentLastName       string           `json:"student_last_name"`
}

type Skill struct {
	ID            uuid.UUID `json:"id"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
	Name          string    `json:"name"`
}

type StudentSkillResponse struct {
	CourseParticipationID uuid.UUID  `json:"course_participation_id"`
	SkillID               uuid.UUID  `json:"skill_id"`
	SkillLevel            SkillLevel `json:"skill_level"`
}

type StudentTeamPreferenceResponse struct {
	CourseParticipationID uuid.UUID `json:"course_participation_id"`
	TeamID                uuid.UUID `json:"team_id"`
	Preference            int32     `json:"preference"`
}

type SurveyTimeframe struct {
	CoursePhaseID  uuid.UUID        `json:"course_phase_id"`
	SurveyStart    pgtype.Timestamp `json:"survey_start"`
	SurveyDeadline pgtype.Timestamp `json:"survey_deadline"`
}

type Team struct {
	ID            uuid.UUID        `json:"id"`
	Name          string           `json:"name"`
	CoursePhaseID uuid.UUID        `json:"course_phase_id"`
	CreatedAt     pgtype.Timestamp `json:"created_at"`
}

type Tutor struct {
	CoursePhaseID         uuid.UUID `json:"course_phase_id"`
	CourseParticipationID uuid.UUID `json:"course_participation_id"`
	FirstName             string    `json:"first_name"`
	LastName              string    `json:"last_name"`
	TeamID                uuid.UUID `json:"team_id"`
}
