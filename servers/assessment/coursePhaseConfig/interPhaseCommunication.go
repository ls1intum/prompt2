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

func GetTeamsForCoursePhase(ctx context.Context, authHeader string, coursePhaseID uuid.UUID) ([]coursePhaseConfigDTO.Team, error) {
	coreURL := utils.GetCoreUrl()
	cpWithResoultion, err := promptSDK.FetchAndMergeCoursePhaseWithResolution(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("could not fetch course phase with resolution: ", err)
		return nil, errors.New("could not fetch course phase with resolution")
	}

	teams := make([]coursePhaseConfigDTO.Team, 0)
	teamsRaw, teamsExists := cpWithResoultion["teams"]
	if !teamsExists {
		log.Warn("No 'teams' field found in course phase resolution")
		return teams, nil
	}

	teamsSlice, isSlice := teamsRaw.([]interface{})
	if !isSlice {
		log.Error("'teams' field is not a slice")
		return nil, errors.New("invalid teams data structure")
	}

	for i, teamData := range teamsSlice {
		teamMap, isMap := teamData.(map[string]interface{})
		if !isMap {
			log.Warnf("Skipping team at index %d: not a valid map", i)
			continue
		}

		teamIDRaw, idExists := teamMap["id"]
		if !idExists {
			log.Warnf("Skipping team at index %d: missing 'id' field", i)
			continue
		}
		teamIDStr, isString := teamIDRaw.(string)
		if !isString {
			log.Warnf("Skipping team at index %d: 'id' field is not a string", i)
			continue
		}
		teamID, err := uuid.Parse(teamIDStr)
		if err != nil {
			log.Warnf("Skipping team at index %d: invalid UUID format for 'id': %v", i, err)
			continue
		}

		teamNameRaw, nameExists := teamMap["name"]
		if !nameExists {
			log.Warnf("Skipping team at index %d: missing 'name' field", i)
			continue
		}
		teamName, isNameString := teamNameRaw.(string)
		if !isNameString {
			log.Warnf("Skipping team at index %d: 'name' field is not a string", i)
			continue
		}

		members := make([]coursePhaseConfigDTO.TeamMember, 0)
		membersRaw, membersExists := teamMap["members"]
		if membersExists {
			membersSlice, isMembersSlice := membersRaw.([]interface{})
			if isMembersSlice {
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
			} else {
				log.Warnf("Team %s: 'members' field is not a slice", teamName)
			}
		}

		team := coursePhaseConfigDTO.Team{
			ID:      teamID,
			Name:    teamName,
			Members: members,
		}
		teams = append(teams, team)
	}

	return teams, nil
}
