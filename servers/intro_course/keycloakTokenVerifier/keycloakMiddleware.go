package keycloakTokenVerifier

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// TODO: this is mostly copied from the core and shall be move this into a go library
// Validates the token and extracts the claims from the token.
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

		if !checkAuthorizedParty(claims, KeycloakTokenVerifierSingleton.expectedAuthorizedParty) {
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

		matriculationNumber, ok := claims["matriculation_number"].(string)
		if !ok {
			log.Error("Failed to extract user matriculation number (sub) from token claims")
		}

		universityLogin, ok := claims["university_login"].(string)
		if !ok {
			log.Error("Failed to extract user university login (sub) from token claims")
		}

		// Retrieve all user's roles from the token (if any) for the audience prompt-server (clientID)
		userRoles, err := checkKeycloakRoles(claims)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "could not authenticate user"})
			return
		}

		// Store the extracted roles in the context
		c.Set("userRoles", userRoles)
		c.Set("userID", userID)
		c.Set("userEmail", userEmail)
		c.Set("matriculationNumber", matriculationNumber)
		c.Set("universityLogin", universityLogin)
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

func checkKeycloakRoles(claims map[string]interface{}) (map[string]bool, error) {
	userRoles := make(map[string]bool)
	if !checkAudience(claims, KeycloakTokenVerifierSingleton.ClientID) {
		log.Debug("No keycloak roles found for ClientID")
		return userRoles, nil
	}

	// user has Prompt keycloak roles
	resourceAccess, err := extractResourceAccess(claims)
	if err != nil {
		log.Error("Failed to extract resource access: ", err)
		return nil, errors.New("could not authenticate user")
	}

	rolesInterface, ok := resourceAccess[KeycloakTokenVerifierSingleton.ClientID].(map[string]interface{})["roles"]
	if !ok {
		log.Error("Failed to extract roles from resource access")
		return nil, errors.New("could not authenticate user")
	}

	roles, ok := rolesInterface.([]interface{})
	if !ok {
		log.Error("Roles are not in expected format")
		return nil, errors.New("could not authenticate user")
	}

	// Convert roles to map[string]bool for easier downstream usage
	for _, role := range roles {
		if roleStr, ok := role.(string); ok {
			userRoles[roleStr] = true
		}
	}
	return userRoles, nil
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
