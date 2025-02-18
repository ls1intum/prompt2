package utils

import "strings"

func GetCoreUrl() string {
	localHost := "http://localhost:8080"
	coreHost := GetEnv("CORE_HOST", localHost)
	// if not localhost add https
	if coreHost != localHost && !strings.HasPrefix(coreHost, "https://") {
		coreHost = "https://" + coreHost
	}
	return coreHost
}
