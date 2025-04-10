package categoryDTO

type CreateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Weight      int32  `json:"weight"`
}
