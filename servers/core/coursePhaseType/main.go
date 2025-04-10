package coursePhaseType

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

func InitCoursePhaseTypeModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCoursePhaseTypeRouter(routerGroup)
	CoursePhaseTypeServiceSingleton = &CoursePhaseTypeService{
		queries: queries,
		conn:    conn,
	}

	// initialize course phase types
	err := initInterview()
	if err != nil {
		log.Fatal("failed to init interview phase type: ", err)
	}

	err = initMatching()
	if err != nil {
		log.Fatal("failed to init matching phase type: ", err)
	}

	err = initIntroCourseDeveloper()
	if err != nil {
		log.Fatal("failed to init intro course developer phase type: ", err)
	}

	err = initIntroCourseTutor()
	if err != nil {
		log.Fatal("failed to init intro course tutor phase type: ", err)
	}

	err = initDevOpsChallenge()
	if err != nil {
		log.Fatal("failed to init dev ops challenge phase type: ", err)
	}

	err = initAssessmentChallenge()
	if err != nil {
		log.Fatal("failed to init assessment phase type: ", err)
	}

	err = initTeamAllocation()
	if err != nil {
		log.Fatal("failed to init team allocation phase type: ", err)
	}
}
