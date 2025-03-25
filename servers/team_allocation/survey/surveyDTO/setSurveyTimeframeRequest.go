package surveyDTO

import (
	"time"

	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type SurveyTimeframe struct {
	SurveyStart    time.Time `json:"surveyStart" binding:"required"`
	SurveyDeadline time.Time `json:"surveyDeadline" binding:"required"`
}

func GetSurveyTimeframeDTOFromDBModel(timeframe db.GetSurveyTimeframeRow) SurveyTimeframe {
	return SurveyTimeframe{
		SurveyStart:    timeframe.SurveyStart.Time,
		SurveyDeadline: timeframe.SurveyDeadline.Time,
	}
}
