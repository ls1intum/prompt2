package config

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	configdto "github.com/ls1intum/prompt2/servers/team_allocation/config/configDTO"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/survey"
)

type ConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ConfigServiceSingleton *ConfigService

func GetDefaultTeamAllocationConfig(c *gin.Context, coursePhaseID uuid.UUID) (config configdto.TeamAllocationConfig, err error) {
	surveyTimeframe, err := survey.GetSurveyTimeframe(c, coursePhaseID)
	if err != nil {
		return configdto.TeamAllocationConfig{}, err
	}

	teams, err := ConfigServiceSingleton.queries.GetTeamsByCoursePhase(c, coursePhaseID)
	if err != nil {
		return configdto.TeamAllocationConfig{}, err
	}
	teamsExist := len(teams) > 0

	skills, err := ConfigServiceSingleton.queries.GetSkillsByCoursePhase(c, coursePhaseID)
	if err != nil {
		return configdto.TeamAllocationConfig{}, err
	}
	skillsExist := len(skills) > 0

	return configdto.TeamAllocationConfig{
		Configurations: map[string]bool{
			"surveyTimeframe": surveyTimeframe.TimeframeSet,
			"teams":           teamsExist,
			"skills":          skillsExist,
		},
	}, nil
}
