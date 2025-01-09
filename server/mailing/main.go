package mailing

import (
	"net/mail"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func InitMailingModule(router *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, smtpHost, smtpPort, senderName, senderEmail, clientURL string) {
	MailingServiceSingleton = &MailingService{
		smtpHost:    smtpHost,
		smtpPort:    smtpPort,
		senderEmail: mail.Address{Name: senderName, Address: senderEmail},
		clientURL:   clientURL,
		queries:     queries,
		conn:        conn,
	}

	setupMailingRouter(router, keycloak.KeycloakMiddleware, checkAccessControlByIDWrapper)
}

func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "coursePhaseID", allowedRoles...)
}
