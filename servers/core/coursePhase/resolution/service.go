package resolution

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhase/resolution/resolutionDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type ResolutionService struct {
	queries  db.Queries
	conn     *pgxpool.Pool
	coreHost string
}

var ResolutionServiceSingleton *ResolutionService

// ReplaceResolutionURLs rewrites BaseURL for each resolution.
//
// • If resolveLocally == true and a local resolution exists, its URL is preferred; otherwise we fall back to the core host. (For example, when requesting server is in same docker network as providing server.)
// • The placeholder {CORE_HOST} is always replaced by the normalised core host.
func ReplaceResolutionURLs(ctx context.Context, resolutions []resolutionDTO.Resolution, resolveLocally bool) ([]resolutionDTO.Resolution, error) {

	if len(resolutions) == 0 {
		return resolutions, nil
	}

	coreHost := normaliseHost(ResolutionServiceSingleton.coreHost)

	for i, r := range resolutions {
		base := r.BaseURL

		if resolveLocally {
			localURL, err := ResolutionServiceSingleton.queries.GetLocalResolution(ctx, r.CoursePhaseID)
			if err != nil {
				return nil, fmt.Errorf("fetching local resolution for coursePhase %s: %w",
					r.CoursePhaseID, err)
			}

			if localURL.Valid && localURL.String != "" {
				base = localURL.String
			} else {
				log.WithField("coursePhaseID", r.CoursePhaseID).
					Debug("no local resolution found; falling back to core host")
			}
		}

		resolutions[i].BaseURL = strings.ReplaceAll(base, "{CORE_HOST}", coreHost)
	}

	return resolutions, nil
}

// normaliseHost ensures the host string starts with a scheme.
func normaliseHost(host string) string {
	if strings.HasPrefix(host, "http://") || strings.HasPrefix(host, "https://") {
		return host
	}
	return "https://" + host
}
