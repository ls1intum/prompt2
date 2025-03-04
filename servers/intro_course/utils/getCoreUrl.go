package utils

func GetCoreUrl() string {
	localHost := "http://localhost:8080"
	coreHost := GetEnv("CORE_SERVER_HOST", localHost)
	return coreHost
}
