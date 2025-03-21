package infrastructureSetup

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	log "github.com/sirupsen/logrus"
	gitlab "gitlab.com/gitlab-org/api/client-go"
)

type InfrastructureService struct {
	queries           db.Queries
	conn              *pgxpool.Pool
	gitlabAccessToken string
}

var InfrastructureServiceSingleton *InfrastructureService

const TOP_LEVEL_GROUP_NAME = "ASE"
const I_PRAKTIKUM_GROUP_NAME = "iPraktikum"

func CreateCourseInfrastructure(coursePhaseID uuid.UUID, semesterTag string) error {
	// 1.) Get Top Level Group
	ipraktikumGroup, err := getiPraktikumGroup()
	if err != nil {
		return err
	}

	courseGroup, err := createCourseIterationGroup(semesterTag, ipraktikumGroup.ID)
	if err != nil {
		log.Error("Failed to create course iteration group: ", err)
		return err
	}

	// 2.) Create the developer group
	_, err = createDeveloperTopLevelGroup(courseGroup.ID)
	if err != nil {
		log.Error("Failed to create developer group: ", err)
	}

	// 3.) Create the tutor groups
	_, err = createTeachingGroup(courseGroup.ID, "tutor")
	if err != nil {
		log.Error("Failed to create tutor group: ", err)
	}

	// 4.) Create the coach group
	_, err = createTeachingGroup(courseGroup.ID, "coach")
	if err != nil {
		log.Error("Failed to create coach group: ", err)
	}

	// 5.) Create the introCourse group
	_, err = createTeachingGroup(courseGroup.ID, "IntroCourse")
	if err != nil {
		log.Error("Failed to create introCourse group: ", err)
	}

	return nil
}

func CreateStudentInfrastructure(ctx context.Context, coursePhaseID, courseParticipationID uuid.UUID, semesterTag, tumID, submissionDeadline string) error {
	// 1.) get the student developer profile
	devProfile, err := InfrastructureServiceSingleton.queries.GetDeveloperProfileByCourseParticipationID(ctx, db.GetDeveloperProfileByCourseParticipationIDParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("Failed to get developer profile: ", err)
		return errors.New("failed to get developer profile")
	} else if devProfile.GitlabUsername == "" {
		log.Error("cannot create student repo due to missing student gitlab username")
		return errors.New("cannot create student repo due to missing student gitlab username")
	}

	// 2.) Get the assigned tutor
	tutor, err := InfrastructureServiceSingleton.queries.GetAssignedTutor(ctx, db.GetAssignedTutorParams{
		AssignedStudent: pgtype.UUID{Bytes: courseParticipationID, Valid: true},
		CoursePhaseID:   coursePhaseID,
	})
	if err != nil {
		log.Error("Failed to get assigned tutor: ", err)
		return errors.New("failed to get assigned tutor")
	} else if tutor.GitlabUsername.Valid == false || tutor.GitlabUsername.String == "" {
		log.Error("cannot create student repo due to missing tutor gitlab username")
		return errors.New("cannot create student repo due to missing tutor gitlab username")
	}

	log.Info("Creating student repo for student: ", devProfile.GitlabUsername, " with tutor: ", tutor.AssignedTutor)

	// 3.) Get Gitlab IDs
	studentGitlabUser, err := getUserID(devProfile.GitlabUsername)
	if err != nil {
		log.Error("Failed to get student gitlab id: ", err)
		return errors.New("failed to get student gitlab id")
	}

	tutorGitlabUser, err := getUserID(tutor.GitlabUsername.String)
	if err != nil {
		log.Error("Failed to get tutor gitlab id: ", err)
		return errors.New("failed to get tutor gitlab id")
	}

	ipraktikumGroup, err := getiPraktikumGroup()
	if err != nil {
		return err
	}

	semesterGroup, err := getSubGroup(semesterTag, ipraktikumGroup.ID)
	if err != nil {
		log.Error("Failed to get course group: ", err)
		return err
	}

	introCourseGroup, err := getSubGroup("IntroCourse", semesterGroup.ID)
	if err != nil {
		log.Error("Failed to get intro course group: ", err)
		return err
	}

	// 2.) Create the student group
	err = CreateStudentProject(tumID, studentGitlabUser.ID, tutorGitlabUser.ID, introCourseGroup.ID, submissionDeadline)
	if err != nil {
		log.Error("Failed to create student project: ", err)
		return err
	}

	err = InfrastructureServiceSingleton.queries.AddGitlabStatus(ctx, db.AddGitlabStatusParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})

	if err != nil {
		log.Error("Failed to update gitlab status in db: ", err)
	}

	return nil
}

func getiPraktikumGroup() (*gitlab.Group, error) {
	aseGroup, err := getGroup(TOP_LEVEL_GROUP_NAME)
	if err != nil {
		log.Error("Failed to get group: ", err)
		return nil, err
	}

	// 2.) Get iPraktikum Group
	ipraktikumGroup, err := getSubGroup(I_PRAKTIKUM_GROUP_NAME, aseGroup.ID)
	if err != nil {
		log.Error("Failed to get group: ", err)
		return nil, err
	}

	return ipraktikumGroup, nil

}

func GetAllStudentInfrastructureStatus(c c.Context, coursePhaseID string) {

}
