package developerAccountSetupDTO

type InviteRequest struct {
	Data struct {
		Type       string `json:"type"`
		Attributes struct {
			Email               string   `json:"email"`
			FirstName           string   `json:"firstName"`
			LastName            string   `json:"lastName"`
			Roles               []string `json:"roles"`
			ProvisioningAllowed bool     `json:"provisioningAllowed"`
		} `json:"attributes"`
	} `json:"data"`
}
