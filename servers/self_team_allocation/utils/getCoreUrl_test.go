package utils

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func unsetEnvForTest(t *testing.T, key string) {
	original, wasSet := os.LookupEnv(key)
	if wasSet {
		t.Cleanup(func() { _ = os.Setenv(key, original) })
	} else {
		t.Cleanup(func() { _ = os.Unsetenv(key) })
	}
	_ = os.Unsetenv(key)
}

func TestGetCoreUrlDefaultsToLocalhost(t *testing.T) {
	unsetEnvForTest(t, "SERVER_CORE_HOST")
	require.Equal(t, "http://localhost:8080", GetCoreUrl())
}

func TestGetCoreUrlUsesEnvironmentVariable(t *testing.T) {
	t.Setenv("SERVER_CORE_HOST", "https://core.example.com")
	require.Equal(t, "https://core.example.com", GetCoreUrl())
}
