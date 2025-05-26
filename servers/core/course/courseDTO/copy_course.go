package courseDTO

import "github.com/jackc/pgx/v5/pgtype"

type CopyCourse struct {
	Name        string      `json:"name"`
	SemesterTag pgtype.Text `json:"semesterTag"`
	StartDate   pgtype.Date `json:"startDate"`
	EndDate     pgtype.Date `json:"endDate"`
}
