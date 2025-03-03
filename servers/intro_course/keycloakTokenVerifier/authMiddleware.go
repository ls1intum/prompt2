package keycloakTokenVerifier

import (
	"net/http"
	"slices"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

// AuthenticationMiddleware creates a composite middleware which always
// applies KeycloakMiddleware first and conditionally chains additional
// middlewares based on the allowed roles:
//   - If allowedRoles contains "Lecturer", "Editor" or a custom role name
//     (any value other than "Admin" or "Student"), then it calls GetLecturerAndEditorRole.
//     For custom roles the middleware checks if the user's roles include customGroupPrefix+customRole.
//   - If allowedRoles contains "Student", then it calls IsStudentOfCoursePhaseMiddleware.
func AuthenticationMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Always call Keycloak middleware first.
		KeycloakMiddleware()(c)
		if c.IsAborted() {
			return
		}

		// 0.) Transform allowedRoles to string map
		allowedRolesMap := make(map[string]bool)
		for _, role := range allowedRoles {
			allowedRolesMap[role] = true
		}

		// get the user roles
		rolesVal, exists := c.Get("userRoles")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user roles not found"})
			return
		}

		userRoles, ok := rolesVal.(map[string]bool)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user roles not found"})
			return
		}

		// 1.) Check for PROMPT_Admin and PROMPT_Lecturer roles.
		if allowedRolesMap["PROMPT_Admin"] && userRoles["PROMPT_Admin"] {
			// Access granted for Admin.
			c.Next()
			return
		}

		if allowedRolesMap["PROMPT_Lecturer"] && userRoles["PROMPT_Lecturer"] {
			// Access granted for Lecturer.
			c.Next()
			return
		}

		// 2.) Check for Lecturer, Editor, Custom Groups
		containsCustomGroupRights := containsCustomGroupName(allowedRoles...)
		if containsCustomGroupRights || allowedRolesMap[CourseLecturer] || allowedRolesMap[CourseEditor] {
			GetLecturerAndEditorRole()(c)
			if c.IsAborted() {
				return
			}

			if allowedRolesMap[CourseLecturer] {
				isLecturer, ok := c.Get("isLecturer")
				if ok && isLecturer.(bool) {
					// Access granted for Lecturer.
					c.Next()
					return
				}
			}

			if allowedRolesMap[CourseEditor] {
				isEditor, ok := c.Get("isEditor")
				if ok && isEditor.(bool) {
					// Access granted for Editor.
					c.Next()
					return
				}
			}

			if containsCustomGroupRights {
				customGroupPrefix, ok := c.Get("customGroupPrefix")
				if !ok {
					log.Error("customGroupPrefix not found")
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "could not authenticate"})
					return
				}
				customGroupPrefixStr, ok := customGroupPrefix.(string)
				if !ok {
					log.Error("customGroupPrefix not a string")
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "could not authenticate"})
					return
				}

				for _, role := range allowedRoles {
					if userRoles[customGroupPrefixStr+role] {
						// Access granted for custom role.
						c.Next()
						return
					}
				}
			}
		}

		// 3.) Check for Student
		if allowedRolesMap[CourseStudent] {
			IsStudentOfCoursePhaseMiddleware()(c)
			if c.IsAborted() {
				return
			}

			isStudent, ok := c.Get("isStudentOfCoursePhase")
			if ok && isStudent.(bool) {
				// Access granted for Student.
				c.Next()
				return
			}
		}

		// Access denied.
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "could not authenticate"})
	}
}

func containsCustomGroupName(allowedRoles ...string) bool {
	nonCustomGroupRoles := []string{PromptAdmin, PromptLecturer, CourseLecturer, CourseEditor, CourseStudent}

	for _, role := range allowedRoles {
		if !slices.Contains(nonCustomGroupRoles, role) {
			return true
		}
	}

	return false
}
