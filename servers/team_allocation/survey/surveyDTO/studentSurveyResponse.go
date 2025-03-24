package surveyDTO

import db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"

type StudentSurveyResponse struct {
	TeamPreferences []StudentTeamPreferenceResponse `json:"teamPreferences"`
	SkillResponses  []StudentSkillResponse          `json:"skillResponses"`
}

func GetStudentSurveyResponseDTOFromDBModels(teamPreferences []db.GetStudentTeamPreferencesRow, skillResponses []db.GetStudentSkillResponsesRow) StudentSurveyResponse {
	teamPreferencesDTO := GetStudentTeamPreferenceRepsonseDTOsFromDBModel(teamPreferences)
	skillResponsesDTO := GetStudentSkillResponsesDTOFromDBModel(skillResponses)

	return StudentSurveyResponse{
		TeamPreferences: teamPreferencesDTO,
		SkillResponses:  skillResponsesDTO,
	}
}
