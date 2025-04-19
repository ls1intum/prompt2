package resolution

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type ResolutionService struct {
	queries          db.Queries
	conn             *pgxpool.Pool
	coreHost         string
	isDevEnvironment bool
}

var ResolutionServiceSingleton *ResolutionService

func ReplaceResolutionURLs(ctx context.Context, resolutionDTOs []Resolution, resolveLocally bool) ([]Resolution, error) {

	coreHost := ResolutionServiceSingleton.coreHost
	if !strings.HasPrefix(coreHost, "http://") && !strings.HasPrefix(coreHost, "https://") {
		coreHost = "https://" + coreHost
	}

	for i := range resolutionDTOs {
		r := &resolutionDTOs[i] // pointer to the real element, not a copy

		if !strings.HasPrefix(r.BaseURL, "{CORE_HOST}") {
			continue
		}

		// Decide which host should replace {CORE_HOST}
		targetHost := coreHost
		if resolveLocally {
			localURL, err := ResolutionServiceSingleton.queries.GetLocalResolution(ctx, r.CoursePhaseID)
			if err != nil {
				return nil, fmt.Errorf("failed to get local resolution: %w", err)
			}

			if localURL.Valid && localURL.String != "" {
				targetHost = localURL.String
			} else {
				log.Warn("no local resolution found, defaulting to core host")
			}
		}

		r.BaseURL = strings.ReplaceAll(r.BaseURL, "{CORE_HOST}", targetHost)
	}

	return resolutionDTOs, nil

}
