package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
)

func GetUserUUIDFromContext(c *gin.Context) (uuid.UUID, error) {
    return parseUUIDString(c.GetString(keycloakTokenVerifier.CtxUserID))
}

func parseUUIDString(value string) (uuid.UUID, error) {
    return uuid.Parse(value)
}
