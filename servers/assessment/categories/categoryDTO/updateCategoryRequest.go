package categoryDTO

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	Description string `json:"description"`
	Weight      int32  `json:"weight"`
}
