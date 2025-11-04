package utils

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
)

func DeferRollback(tx pgx.Tx, ctx context.Context) {
	err := tx.Rollback(ctx)
	if err != nil && !errors.Is(err, pgx.ErrTxClosed) {
		log.Error("Error rolling back transaction: ", err)
	}
}
