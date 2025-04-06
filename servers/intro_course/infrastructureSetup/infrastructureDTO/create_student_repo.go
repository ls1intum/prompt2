package infrastructureDTO

type CreateStudentRepo struct {
	SemesterTag        string `json:"semesterTag"`
	RepoName           string `json:"repoName"`
	StudentName        string `json:"studentName"`
	SubmissionDeadline string `json:"submissionDeadline"`
}
