package resolution

import (
	"context"
	"strings"

	"github.com/niclasheun/prompt2.0/coursePhase/resolution/resolutionDTO"
)

type ResolutionService struct {
	coreHost string
}

var ResolutionServiceSingleton *ResolutionService

// ReplaceResolutionURLs rewrites BaseURL for each resolution.
//
// • If resolveLocally == true and a local resolution exists, its URL is preferred; otherwise we fall back to the core host. (For example, when requesting server is in same docker network as providing server.)
// • The placeholder {CORE_HOST} is always replaced by the normalised core host.
func ReplaceResolutionURLs(ctx context.Context, resolutions []resolutionDTO.Resolution) ([]resolutionDTO.Resolution, error) {
	if len(resolutions) == 0 {
		return resolutions, nil
	}

	coreHost := normaliseHost(ResolutionServiceSingleton.coreHost)

	for i, r := range resolutions {
		resolutions[i].BaseURL = strings.ReplaceAll(r.BaseURL, "{CORE_HOST}", coreHost)
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
