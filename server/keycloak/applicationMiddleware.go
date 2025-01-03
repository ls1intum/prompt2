package keycloak

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// this is a reduced middleware, which does not require an prompt service account
func ApplicationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := extractBearerToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		ctx := c.Request.Context()
		idToken, err := verifier.Verify(ctx, tokenString)
		if err != nil {
			log.Error("Failed to validate token: ", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, err := extractClaims(idToken)
		if err != nil {
			log.Error("Failed to parse claims: ", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		if !checkAuthorizedParty(claims, KeycloakSingleton.expectedAuthorizedParty) {
			log.Error("Token authorized party mismatch")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token authorized party mismatch"})
			return
		}

		// extract user Id
		userID, ok := claims["sub"].(string)
		if !ok {
			log.Error("Failed to extract user ID (sub) from token claims")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}

		userEmail, ok := claims["email"].(string)
		if !ok {
			log.Error("Failed to extract user ID (sub) from token claims")
		}

		// Store the extracted roles in the context
		c.Set("userID", userID)
		c.Set("userEmail", userEmail)
		c.Next()
	}
}
