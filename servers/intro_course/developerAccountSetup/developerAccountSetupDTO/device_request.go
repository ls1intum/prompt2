package developerAccountSetupDTO

type DeviceRequest struct {
	Data struct {
		Type       string `json:"type"`
		Attributes struct {
			Name     string `json:"name"`
			UDID     string `json:"udid"`
			Platform string `json:"platform"`
		} `json:"attributes"`
	} `json:"data"`
}
