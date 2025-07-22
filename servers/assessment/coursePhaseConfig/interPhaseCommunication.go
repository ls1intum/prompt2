package coursePhaseConfig

import (
	"context"
	"errors"

	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

func GetParticipationsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.AssessmentParticipationWithStudent, error) {
	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase participations with students: ", err)
		return nil, errors.New("could not fetch course phase participations with students")
	}

	return coursePhaseConfigDTO.GetAssessmentStudentsFromParticipations(participations), nil
}

func GetParticipationForStudent(ctx context.Context, authHeader string, coursePhaseID uuid.UUID, courseParticipationID uuid.UUID) (coursePhaseConfigDTO.AssessmentParticipationWithStudent, error) {
	coreURL := utils.GetCoreUrl()
	participation, err := promptSDK.FetchAndMergeCourseParticipationWithResolution(coreURL, authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("could not fetch course phase participation with student: ", err)
		return coursePhaseConfigDTO.AssessmentParticipationWithStudent{}, errors.New("could not fetch course phase participation with student")
	}

	return coursePhaseConfigDTO.GetAssessmentStudentFromParticipation(participation), nil
}

// parseTeamMembers parses team members from a raw interface slice
func parseTeamMembers(membersRaw interface{}) []promptTypes.Person {
	members := make([]promptTypes.Person, 0)

	if membersRaw == nil {
		return members
	}

	membersSlice := membersRaw.([]interface{})
	for _, memberData := range membersSlice {
		memberMap := memberData.(map[string]interface{})

		id, _ := uuid.Parse(memberMap["courseParticipationID"].(string))
		firstName := memberMap["firstName"].(string)
		lastName := memberMap["lastName"].(string)

		member := promptTypes.Person{
			ID:        id,
			FirstName: firstName,
			LastName:  lastName,
		}
		members = append(members, member)
	}

	return members
}

// parseTeam parses individual team data from a map interface
func parseTeam(teamData interface{}, index int) (promptTypes.Team, bool) {
	teamMap, isMap := teamData.(map[string]interface{})
	if !isMap {
		log.Warnf("Skipping team at index %d: not a valid map", index)
		return promptTypes.Team{}, false
	}

	// Parse team ID
	teamIDRaw, idExists := teamMap["id"]
	if !idExists {
		log.Warnf("Skipping team at index %d: missing 'id' field", index)
		return promptTypes.Team{}, false
	}
	teamIDStr, isString := teamIDRaw.(string)
	if !isString {
		log.Warnf("Skipping team at index %d: 'id' field is not a string", index)
		return promptTypes.Team{}, false
	}
	teamID, err := uuid.Parse(teamIDStr)
	if err != nil {
		log.Warnf("Skipping team at index %d: invalid UUID format for 'id': %v", index, err)
		return promptTypes.Team{}, false
	}

	// Parse team name
	teamNameRaw, nameExists := teamMap["name"]
	if !nameExists {
		log.Warnf("Skipping team at index %d: missing 'name' field", index)
		return promptTypes.Team{}, false
	}
	teamName, isNameString := teamNameRaw.(string)
	if !isNameString {
		log.Warnf("Skipping team at index %d: 'name' field is not a string", index)
		return promptTypes.Team{}, false
	}

	// Parse team members
	membersRaw, membersExists := teamMap["members"]
	var members []promptTypes.Person
	if membersExists {
		members = parseTeamMembers(membersRaw)
	} else {
		members = make([]promptTypes.Person, 0)
	}

	team := promptTypes.Team{
		ID:      teamID,
		Name:    teamName,
		Members: members,
	}

	return team, true
}

// parseTeams parses the teams slice from the course phase resolution
func parseTeams(teamsRaw interface{}) ([]promptTypes.Team, error) {
	teams := make([]promptTypes.Team, 0)

	if teamsRaw == nil {
		log.Warn("No 'teams' field found in course phase resolution")
		return teams, nil
	}

	teamsSlice, isSlice := teamsRaw.([]interface{})
	if !isSlice {
		log.Error("'teams' field is not a slice")
		return nil, errors.New("invalid teams data structure")
	}

	for i, teamData := range teamsSlice {
		if team, ok := parseTeam(teamData, i); ok {
			teams = append(teams, team)
		}
	}

	return teams, nil
}

func GetTeamsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]promptTypes.Team, error) {
	coreURL := utils.GetCoreUrl()
	cpWithResoultion, err := promptSDK.FetchAndMergeCoursePhaseWithResolution(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase with resolution: ", err)
		return nil, errors.New("could not fetch course phase with resolution")
	}

	teamsRaw, teamsExists := cpWithResoultion["teams"]
	if !teamsExists {
		return make([]promptTypes.Team, 0), nil
	}

	return parseTeams(teamsRaw)
}
