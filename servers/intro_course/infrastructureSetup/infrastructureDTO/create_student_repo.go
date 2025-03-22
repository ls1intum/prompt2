package infrastructureDTO

type CreateStudentRepo struct {
	SemesterTag        string `json:"semesterTag"`
	TumID              string `json:"tumID"`
	SubmissionDeadline string `json:"submissionDeadline"`
}
