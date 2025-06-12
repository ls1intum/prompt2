package developerAccountSetup

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

func InitDeveloperAccountSetupModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, issuerID, keyID, privateKey string) {
	setupDeveloperAccountSetupRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	DeveloperAccountSetupServiceSingleton = &DeveloperAccountSetupService{
		queries:    queries,
		conn:       conn,
		issuerID:   issuerID,
		keyID:      keyID,
		privateKey: privateKey,
	}
}
