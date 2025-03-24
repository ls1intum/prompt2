package survey

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

func InitSurveyModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupSurveyRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	SurveyServiceSingleton = &SurveyService{
		queries: queries,
		conn:    conn,
	}
}
