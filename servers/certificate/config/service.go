package config

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/certificate/config/configDTO"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type ConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ConfigServiceSingleton *ConfigService

func NewConfigService(queries db.Queries, conn *pgxpool.Pool) *ConfigService {
	return &ConfigService{
		queries: queries,
		conn:    conn,
	}
}

func GetCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID) (configDTO.CoursePhaseConfig, error) {
	config, err := ConfigServiceSingleton.queries.GetCoursePhaseConfig(ctx, coursePhaseID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Create a default config
			config, err = ConfigServiceSingleton.queries.CreateCoursePhaseConfig(ctx, coursePhaseID)
			if err != nil {
				log.WithError(err).Error("Failed to create default course phase config")
				return configDTO.CoursePhaseConfig{}, err
			}
		} else {
			log.WithError(err).Error("Failed to get course phase config")
			return configDTO.CoursePhaseConfig{}, err
		}
	}

	return configDTO.MapDBConfigToDTOConfig(config), nil
}

func UpdateCoursePhaseConfig(ctx context.Context, coursePhaseID uuid.UUID, templateContent string) (configDTO.CoursePhaseConfig, error) {
	config, err := ConfigServiceSingleton.queries.UpsertCoursePhaseConfig(ctx, db.UpsertCoursePhaseConfigParams{
		CoursePhaseID:   coursePhaseID,
		TemplateContent: pgtype.Text{String: templateContent, Valid: true},
	})
	if err != nil {
		log.WithError(err).Error("Failed to update course phase config")
		return configDTO.CoursePhaseConfig{}, err
	}

	return configDTO.MapDBConfigToDTOConfig(config), nil
}

func GetTemplateContent(ctx context.Context, coursePhaseID uuid.UUID) (string, error) {
	config, err := ConfigServiceSingleton.queries.GetCoursePhaseConfig(ctx, coursePhaseID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", errors.New("no template configured for this course phase")
		}
		log.WithError(err).Error("Failed to get course phase config")
		return "", err
	}

	if !config.TemplateContent.Valid || config.TemplateContent.String == "" {
		return "", errors.New("no template configured for this course phase")
	}

	return config.TemplateContent.String, nil
}
