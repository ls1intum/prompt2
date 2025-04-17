package teaseDTO

import "github.com/google/uuid"

type Allocation struct {
	ProjectID uuid.UUID   `json:"projectId"`
	Students  []uuid.UUID `json:"students"`
}
