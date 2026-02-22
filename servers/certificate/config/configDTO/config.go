package configDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
)

type CoursePhaseConfig struct {
	CoursePhaseID   uuid.UUID  `json:"coursePhaseId"`
	TemplateContent *string    `json:"templateContent,omitempty"`
	HasTemplate     bool       `json:"hasTemplate"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type UpdateConfigRequest struct {
	TemplateContent string `json:"templateContent" binding:"required"`
}

func MapDBConfigToDTOConfig(dbConfig db.CoursePhaseConfig) CoursePhaseConfig {
	var templateContent *string
	if dbConfig.TemplateContent.Valid {
		templateContent = &dbConfig.TemplateContent.String
	}

	return CoursePhaseConfig{
		CoursePhaseID:   dbConfig.CoursePhaseID,
		TemplateContent: templateContent,
		HasTemplate:     dbConfig.TemplateContent.Valid && dbConfig.TemplateContent.String != "",
		CreatedAt:       dbConfig.CreatedAt.Time,
		UpdatedAt:       dbConfig.UpdatedAt.Time,
	}
}
