package courseCopyDTO

import "github.com/jackc/pgx/v5/pgtype"

type CopyCourseRequest struct {
	Name             string      `json:"name"`
	SemesterTag      pgtype.Text `json:"semesterTag"`
	StartDate        pgtype.Date `json:"startDate"`
	EndDate          pgtype.Date `json:"endDate"`
	ShortDescription pgtype.Text `json:"shortDescription"`
	LongDescription  pgtype.Text `json:"longDescription"`
	Template         bool        `json:"template"`
}
