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

		if !checkAuthorizedParty(claims, KeycloakSingleton.expectedAuthorizedParty) {
			log.Error("Token authorized party mismatch")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token authorized party mismatch"})
			return
		}

		// manually check the audience, as the it is disabled in the verifier config (for allowing students to apply)
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
		c.Set("userRoles", userRoles)
		c.Set("userID", userID)
		c.Set("userEmail", userEmail)
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

func checkAuthorizedParty(claims map[string]interface{}, expectedAuthorizedParty string) bool {
	azp, ok := claims["azp"]
	if !ok {
		return false
	}
	return azp == expectedAuthorizedParty
}
