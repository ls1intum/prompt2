package coursePhaseAuth

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhaseAuth/coursePhaseAuthDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	log "github.com/sirupsen/logrus"
)

type CoursePhaseAuthService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseAuthServiceSingleton *CoursePhaseAuthService

func getUserAuth(ctx context.Context, coursePhaseID uuid.UUID, userRoles map[string]bool, matriculationNumber, universityLogin string) (coursePhaseAuthDTO.GetCoursePhaseAuthRoles, error) {
	// use coursePhaseID and userRoles to check for permissions
	courseIdentifier, err := permissionValidation.CourseIdentifierStringFromCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error("Error getting course phase participation: ", err)
		return coursePhaseAuthDTO.GetCoursePhaseAuthRoles{}, err
	}

	// filter the user roles based on the identifier
	courseRelevantRoles := []string{}
	for role, isPresent := range userRoles {
		if isPresent {
			if role == permissionValidation.PromptAdmin {
				courseRelevantRoles = append(courseRelevantRoles, permissionValidation.PromptAdmin)
			} else if strings.HasPrefix(role, courseIdentifier) {
				courseRelevantRoles = append(courseRelevantRoles, role)
			}
		}
	}

	authResponse := coursePhaseAuthDTO.GetCoursePhaseAuthRoles{
		Roles: courseRelevantRoles,
	}

	studentRole := courseIdentifier + "-Student"
	if userRoles[studentRole] {
		// get the coursePhaseParticipationID and courseParticipationID
		coursePhaseParticipation, err := CoursePhaseAuthServiceSingleton.queries.GetCoursePhaseParticipationByUniversityLoginAndCoursePhase(ctx, db.GetCoursePhaseParticipationByUniversityLoginAndCoursePhaseParams{
			UniversityLogin:     pgtype.Text{String: universityLogin, Valid: true},
			MatriculationNumber: pgtype.Text{String: matriculationNumber, Valid: true},
			ToCoursePhaseID:     coursePhaseID,
		})
		if err == nil {
			authResponse.CourseParticipationID = coursePhaseParticipation.CourseParticipationID
			authResponse.CoursePhaseParticipationID = coursePhaseParticipation.CoursePhaseParticipationID
		} else if errors.Is(err, sql.ErrNoRows) {
			log.Debug("No course phase participation found for student")
			authResponse.CourseParticipationID = uuid.Nil
			authResponse.CoursePhaseParticipationID = uuid.Nil
		} else {
			log.Error("Error getting course phase participation: ", err)
			return coursePhaseAuthDTO.GetCoursePhaseAuthRoles{}, err
		}

	}

	return authResponse, nil
}
