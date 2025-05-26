package categoryDTO

type CreateCategoryRequest struct {
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	Description string `json:"description"`
	Weight      int32  `json:"weight"`
}
