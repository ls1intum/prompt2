package keycloak

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// KeycloakMiddleware creates a Gin middleware to:
// 1. Extract and validate the Bearer token from the Authorization header.
// 2. Verify the token using the OIDC verifier.
// 3. Check that the token audience matches the configured client ID.
// 4. Confirm that the user has all of the required roles.
//
// If any validation fails, the request is aborted with an appropriate HTTP status code.
// On success, "resourceAccess" is attached to the context for further use.
func KeycloakMiddleware() gin.HandlerFunc {
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

		if !checkAudience(claims, KeycloakSingleton.ClientID) {
			log.Error("Token audience mismatch")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token audience mismatch"})
			return
		}

		resourceAccess, err := extractResourceAccess(claims)
		if err != nil {
			log.Error("Failed to extract resource access: ", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		rolesInterface, ok := resourceAccess[KeycloakSingleton.ClientID].(map[string]interface{})["roles"]
		if !ok {
			log.Error("Failed to extract roles from resource access")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Failed to extract roles"})
			return
		}

		roles, ok := rolesInterface.([]interface{})
		if !ok {
			log.Error("Roles are not in expected format")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid roles format"})
			return
		}

		// Convert roles to map[string]bool for easier downstream usage
		userRoles := make(map[string]bool)
		for _, role := range roles {
			if roleStr, ok := role.(string); ok {
				userRoles[roleStr] = true
			}
		}

		// Store the extracted roles in the context
		c.Set("userRoles", userRoles)
		c.Next()
	}
}

// extractBearerToken retrieves and validates the Bearer token from the request's Authorization header.
func extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return "", fmt.Errorf("authorization header missing or invalid")
	}
	return strings.TrimPrefix(authHeader, "Bearer "), nil
}

// extractClaims extracts claims from the verified ID token.
func extractClaims(idToken *oidc.IDToken) (map[string]interface{}, error) {
	var claims map[string]interface{}
	if err := idToken.Claims(&claims); err != nil {
		return nil, err
	}
	return claims, nil
}

// checkAudience ensures that the "aud" claim matches the expected client ID.
func checkAudience(claims map[string]interface{}, expectedClientID string) bool {
	aud, ok := claims["aud"]
	if !ok {
		return false
	}

	switch val := aud.(type) {
	case string:
		return val == expectedClientID
	case []interface{}:
		for _, item := range val {
			if str, ok := item.(string); ok && str == expectedClientID {
				return true
			}
		}
	}
	return false
}

// extractResourceAccess retrieves the "resource_access" claim, which contains role information.
func extractResourceAccess(claims map[string]interface{}) (map[string]interface{}, error) {
	resourceAccess, ok := claims["resource_access"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("resource access missing in token")
	}
	return resourceAccess, nil
}
