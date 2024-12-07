package keycloak

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

// KeycloakMiddleware creates a middleware to validate Keycloak tokens and extract resourceAccess.
func KeycloakMiddleware(requiredRoles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or invalid"})
			return
		}

		// Parse the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure the signing method is correct
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Fetch Keycloak public keys
			kid, ok := token.Header["kid"].(string)
			if !ok {
				return nil, fmt.Errorf("missing kid in token header")
			}

			publicKeys, err := fetchKeycloakCerts()
			if err != nil {
				return nil, fmt.Errorf("failed to fetch keycloak certs: %v", err)
			}

			// Find the matching key by kid
			publicKey, ok := publicKeys[kid]
			if !ok {
				return nil, fmt.Errorf("no matching key found for kid: %s", kid)
			}
			return publicKey, nil
		})

		if err != nil || !token.Valid {
			logrus.Error("Failed to validate token: ", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		logrus.Info("claims: ", claims)

		// Check if the token is intended for the correct client
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			if !checkAudience(claims) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token audience mismatch"})
				return
			}
		}

		// Extract resourceAccess
		resourceAccess, ok := claims["resource_access"].(map[string]interface{})
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Resource access missing in token"})
			return
		}

		// Check roles
		clientAccess, ok := resourceAccess[KeycloakSingleton.ClientID].(map[string]interface{})
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Client-specific roles missing"})
			return
		}

		roles, ok := clientAccess["roles"].([]interface{})
		logrus.Info("roles: ", roles)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Roles missing in token"})
			return
		}

		// Convert roles to a string slice for comparison
		userRoles := make(map[string]bool)
		for _, role := range roles {
			if roleStr, ok := role.(string); ok {
				userRoles[roleStr] = true
			}
		}

		// Verify the user has the required roles
		for _, requiredRole := range requiredRoles {
			if !userRoles[requiredRole] {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": fmt.Sprintf("Missing required role: %s", requiredRole)})
				return
			}
		}

		// Attach resourceAccess to the context
		c.Set("resourceAccess", resourceAccess)
		c.Next()
	}
}

func checkAudience(claims jwt.MapClaims) bool {
	aud, ok := claims["aud"]
	if !ok {
		return false
	}

	// Check if aud is a slice of strings
	audSlice, ok := aud.([]interface{})
	if !ok {
		return false
	}

	// Iterate over Slice and check if client id is in
	for _, audItem := range audSlice {
		if audStr, ok := audItem.(string); ok && audStr == KeycloakSingleton.ClientID {
			return true
		}
	}

	return false
}
