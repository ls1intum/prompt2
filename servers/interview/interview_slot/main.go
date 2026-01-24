package interview_slot

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
)

func InitInterviewSlotModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupInterviewSlotRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	InterviewSlotServiceSingleton = &InterviewSlotService{
		queries: queries,
		conn:    conn,
	}
}
