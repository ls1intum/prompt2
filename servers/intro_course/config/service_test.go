package config

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHandlePhaseConfigReturnsEmptyMap(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler := ConfigHandler{}

	result, err := handler.HandlePhaseConfig(nil)

	assert.NoError(t, err)
	assert.Empty(t, result)
}
