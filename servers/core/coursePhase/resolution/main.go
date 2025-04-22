package resolution

func InitResolutionModule(coreHost string) {
	ResolutionServiceSingleton = &ResolutionService{
		coreHost: coreHost,
	}
}
