package utils

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	localHost := "http://localhost:3000"
	clientHost := GetEnv("CORE_HOST", localHost)
	// if not localhost add https
	if clientHost != localHost && !strings.HasPrefix(clientHost, "https://") {
		clientHost = "https://" + clientHost
	}

	return func(context *gin.Context) {
		context.Writer.Header().Add("Access-Control-Allow-Origin", clientHost)
		context.Writer.Header().Set("Access-Control-Max-Age", "86400")
		context.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		context.Writer.Header().Set("Access-Control-Allow-Headers", "content-Type, content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		context.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		context.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if context.Request.Method == "OPTIONS" {
			context.AbortWithStatus(200)
		} else {
			context.Next()
		}
	}
}
