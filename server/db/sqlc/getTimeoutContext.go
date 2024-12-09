package db

import (
	"context"
	"time"
)

const DEFAULT_TIMEOUT = 3 * time.Second

func GetTimeoutContext(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, DEFAULT_TIMEOUT)
}
