package mailing

import (
	"net/mail"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func InitMailingModule(router *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, smtpHost, smtpPort, smtpUsername, smtpPassword, senderName, senderEmail, clientURL string) {
	MailingServiceSingleton = &MailingService{
		smtpHost:     smtpHost,
		smtpPort:     smtpPort,
		smtpUsername: smtpUsername,
		smtpPassword: smtpPassword,
		senderEmail:  mail.Address{Name: senderName, Address: senderEmail},
		clientURL:    clientURL,
		queries:      queries,
		conn:         conn,
	}

	setupMailingRouter(router, keycloakTokenVerifier.KeycloakMiddleware, checkAccessControlByIDWrapper)
}

func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "coursePhaseID", allowedRoles...)
}
