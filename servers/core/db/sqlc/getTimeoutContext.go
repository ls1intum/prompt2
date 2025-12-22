package db

import (
	"context"
	"time"
)

// DEFAULT_TIMEOUT is used for database calls to avoid hanging requests.
const DEFAULT_TIMEOUT = 10 * time.Second

// GetTimeoutContext returns a context with a sane default timeout.
func GetTimeoutContext(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, DEFAULT_TIMEOUT)
}
