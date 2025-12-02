package utils

func GetCoreUrl() string {
	localHost := "http://localhost:8080"
	coreHost := GetEnv("SERVER_CORE_HOST", localHost)
	return coreHost
}
