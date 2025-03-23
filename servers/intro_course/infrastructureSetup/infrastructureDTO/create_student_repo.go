package infrastructureDTO

type CreateStudentRepo struct {
	SemesterTag        string `json:"semesterTag"`
	RepoName           string `json:"repoName"`
	SubmissionDeadline string `json:"submissionDeadline"`
}
