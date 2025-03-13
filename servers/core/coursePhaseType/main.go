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
	initMatching()
	if err != nil {
		log.Fatal("failed to init matching phase type: ", err)
	}

	initIntroCourseDeveloper()
	if err != nil {
		log.Fatal("failed to init matching phase type: ", err)
	}

	initIntroCourseTutor()
	if err != nil {
		log.Fatal("failed to init matching phase type: ", err)
	}

	initAssessmentChallenge()
	if err != nil {
		log.Fatal("failed to init assessment phase type: ", err)
	}
}
