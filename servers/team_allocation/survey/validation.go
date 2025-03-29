package survey

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/team_allocation/survey/surveyDTO"
	log "github.com/sirupsen/logrus"
)

// ValidateStudentResponse validates the survey submission from a student.
// It checks that:
//   - All skillIDs are valid and associated with the provided coursePhaseID.
//   - All teamIDs are valid and associated with the provided coursePhaseID.
//   - All skill ratings are between 1 and 5.
//   - The team preference list includes all teams for the course phase and
//     has unique, consecutive ranking from 1 to the number of teams.
func ValidateStudentResponse(ctx context.Context, coursePhaseID uuid.UUID, submission surveyDTO.StudentSurveyResponse) error {
	// Fetch the valid teams for the course phase.
	validTeams, err := SurveyServiceSingleton.queries.GetTeamsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("failed to fetch teams: ", err)
		return fmt.Errorf("failed to fetch teams")
	}

	// Fetch the valid skills for the course phase.
	validSkills, err := SurveyServiceSingleton.queries.GetSkillsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("failed to fetch skills: ", err)
		return fmt.Errorf("failed to fetch skills")
	}

	// Build maps of valid team IDs and valid skill IDs.
	validTeamIDs := make(map[uuid.UUID]bool)
	for _, t := range validTeams {
		validTeamIDs[t.ID] = true
	}
	validSkillIDs := make(map[uuid.UUID]bool)
	for _, s := range validSkills {
		validSkillIDs[s.ID] = true
	}

	// Validate each skill response.
	for _, skillResponse := range submission.SkillResponses {
		if skillResponse.Rating < 1 || skillResponse.Rating > 5 {
			return fmt.Errorf("invalid rating for skill %s: rating must be between 1 and 5", skillResponse.SkillID)
		}
		if !validSkillIDs[skillResponse.SkillID] {
			return fmt.Errorf("skill %s is not valid for this course phase", skillResponse.SkillID)
		}
	}

	// Validate team preferences.
	// The list must include exactly all teams available.
	if len(submission.TeamPreferences) != len(validTeams) {
		return fmt.Errorf("team preferences count (%d) does not match number of available teams (%d)",
			len(submission.TeamPreferences), len(validTeams))
	}

	// Check that team preferences include all valid teams and have proper ranking.
	rankMap := make(map[int]bool)
	for _, teamPref := range submission.TeamPreferences {
		if !validTeamIDs[teamPref.TeamID] {
			return fmt.Errorf("team %s is not valid for this course phase", teamPref.TeamID)
		}
		if teamPref.Preference < 1 || int(teamPref.Preference) > len(validTeams) {
			return fmt.Errorf("invalid preference rank %d for team %s", teamPref.Preference, teamPref.TeamID)
		}
		if rankMap[int(teamPref.Preference)] {
			return fmt.Errorf("duplicate preference rank %d found", teamPref.Preference)
		}
		rankMap[int(teamPref.Preference)] = true
	}

	// Ensure that ranks 1 through n are all present.
	for i := 1; i <= len(validTeams); i++ {
		if !rankMap[i] {
			return fmt.Errorf("missing preference rank %d", i)
		}
	}

	return nil
}
