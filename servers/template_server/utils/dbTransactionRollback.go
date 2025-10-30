package utils

import (
	"context"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
)

// TODO move to shared library
func DeferRollback(tx pgx.Tx, ctx context.Context) {
	err := tx.Rollback(ctx)
	if err != nil {
		log.Error("Error rolling back transaction: ", err)
	}
}
