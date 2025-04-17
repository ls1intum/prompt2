package teaseDTO

import "github.com/google/uuid"

type Allocation struct {
	ProjectID uuid.UUID   `json:"project_id"`
	Students  []uuid.UUID `json:"students"`
}
