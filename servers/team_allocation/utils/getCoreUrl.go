package utils

import promptSDK "github.com/ls1intum/prompt-sdk"

func GetCoreUrl() string {
	localHost := "http://localhost:8080"
	coreHost := promptSDK.GetEnv("SERVER_CORE_HOST", localHost)
	return coreHost
}
