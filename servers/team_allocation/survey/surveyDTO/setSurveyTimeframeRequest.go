package surveyDTO

import "time"

type SetSurveyTimeframeRequest struct {
	SurveyStart    time.Time `json:"surveyStart" binding:"required"`
	SurveyDeadline time.Time `json:"surveyDeadline" binding:"required"`
}
