package infrastructureSetup

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

func InitInfrastructureModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, gitlabAccessToken string) {
	setupInfrastructureRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	InfrastructureServiceSingleton = &InfrastructureService{
		queries:           queries,
		conn:              conn,
		gitlabAccessToken: gitlabAccessToken,
	}
}
