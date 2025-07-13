package coursePhaseConfig

import (
	"context"
	"errors"

	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
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
func parseTeamMembers(membersRaw interface{}, teamName string) []coursePhaseConfigDTO.TeamMember {
	members := make([]coursePhaseConfigDTO.TeamMember, 0)

	if membersRaw == nil {
		return members
	}

	membersSlice, isMembersSlice := membersRaw.([]interface{})
	if !isMembersSlice {
		log.Warnf("Team %s: 'members' field is not a slice", teamName)
		return members
	}

	for j, memberData := range membersSlice {
		memberMap, isMemberMap := memberData.(map[string]interface{})
		if !isMemberMap {
			log.Warnf("Skipping member at index %d for team %s: not a valid map", j, teamName)
			continue
		}

		// Extract course participation ID
		cpIDRaw, cpIDExists := memberMap["courseParticipationID"]
		if !cpIDExists {
			log.Warnf("Skipping member at index %d for team %s: missing 'courseParticipationID' field", j, teamName)
			continue
		}
		cpIDStr, isCPIDString := cpIDRaw.(string)
		if !isCPIDString {
			log.Warnf("Skipping member at index %d for team %s: 'courseParticipationID' field is not a string", j, teamName)
			continue
		}
		cpID, err := uuid.Parse(cpIDStr)
		if err != nil {
			log.Warnf("Skipping member at index %d for team %s: invalid UUID format for 'courseParticipationID': %v", j, teamName, err)
			continue
		}

		// Extract student name
		studentNameRaw, studentNameExists := memberMap["studentName"]
		if !studentNameExists {
			log.Warnf("Skipping member at index %d for team %s: missing 'studentName' field", j, teamName)
			continue
		}
		studentName, isStudentNameString := studentNameRaw.(string)
		if !isStudentNameString {
			log.Warnf("Skipping member at index %d for team %s: 'studentName' field is not a string", j, teamName)
			continue
		}

		member := coursePhaseConfigDTO.TeamMember{
			CourseParticipationID: cpID,
			StudentName:           studentName,
		}
		members = append(members, member)
	}

	return members
}

// parseTeam parses individual team data from a map interface
func parseTeam(teamData interface{}, index int) (coursePhaseConfigDTO.Team, bool) {
	teamMap, isMap := teamData.(map[string]interface{})
	if !isMap {
		log.Warnf("Skipping team at index %d: not a valid map", index)
		return coursePhaseConfigDTO.Team{}, false
	}

	// Parse team ID
	teamIDRaw, idExists := teamMap["id"]
	if !idExists {
		log.Warnf("Skipping team at index %d: missing 'id' field", index)
		return coursePhaseConfigDTO.Team{}, false
	}
	teamIDStr, isString := teamIDRaw.(string)
	if !isString {
		log.Warnf("Skipping team at index %d: 'id' field is not a string", index)
		return coursePhaseConfigDTO.Team{}, false
	}
	teamID, err := uuid.Parse(teamIDStr)
	if err != nil {
		log.Warnf("Skipping team at index %d: invalid UUID format for 'id': %v", index, err)
		return coursePhaseConfigDTO.Team{}, false
	}

	// Parse team name
	teamNameRaw, nameExists := teamMap["name"]
	if !nameExists {
		log.Warnf("Skipping team at index %d: missing 'name' field", index)
		return coursePhaseConfigDTO.Team{}, false
	}
	teamName, isNameString := teamNameRaw.(string)
	if !isNameString {
		log.Warnf("Skipping team at index %d: 'name' field is not a string", index)
		return coursePhaseConfigDTO.Team{}, false
	}

	// Parse team members
	membersRaw, membersExists := teamMap["members"]
	var members []coursePhaseConfigDTO.TeamMember
	if membersExists {
		members = parseTeamMembers(membersRaw, teamName)
	} else {
		members = make([]coursePhaseConfigDTO.TeamMember, 0)
	}

	team := coursePhaseConfigDTO.Team{
		ID:      teamID,
		Name:    teamName,
		Members: members,
	}

	return team, true
}

// parseTeams parses the teams slice from the course phase resolution
func parseTeams(teamsRaw interface{}) ([]coursePhaseConfigDTO.Team, error) {
	teams := make([]coursePhaseConfigDTO.Team, 0)

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

func GetTeamsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.Team, error) {
	coreURL := utils.GetCoreUrl()
	cpWithResoultion, err := promptSDK.FetchAndMergeCoursePhaseWithResolution(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase with resolution: ", err)
		return nil, errors.New("could not fetch course phase with resolution")
	}

	teamsRaw, teamsExists := cpWithResoultion["teams"]
	if !teamsExists {
		return make([]coursePhaseConfigDTO.Team, 0), nil
	}

	return parseTeams(teamsRaw)
}
