package utils

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetUserCourseParticipationID(c *gin.Context) (uuid.UUID, error) {
	userCourseParticipationID, exists := c.Get("courseParticipationID")
	if !exists {
		return uuid.UUID{}, errors.New("course participation ID not found in token")
	}

	userCourseParticipationUUID, ok := userCourseParticipationID.(uuid.UUID)
	if !ok {
		userCourseParticipationStr, ok := userCourseParticipationID.(string)
		if !ok {
			return uuid.UUID{}, errors.New("invalid course participation ID format")
		}
		var err error
		userCourseParticipationUUID, err = uuid.Parse(userCourseParticipationStr)
		if err != nil {
			return uuid.UUID{}, errors.New("invalid course participation ID")
		}
	}

	return userCourseParticipationUUID, nil
}

func ValidateStudentOwnership(c *gin.Context, authorCourseParticipationID uuid.UUID) (int, error) {
	userCourseParticipationUUID, err := GetUserCourseParticipationID(c)
	if err != nil {
		return http.StatusUnauthorized, err
	}

	if authorCourseParticipationID != userCourseParticipationUUID {
		return http.StatusForbidden, errors.New("you can only manage your own evaluation completions")
	}

	return http.StatusOK, nil
}
