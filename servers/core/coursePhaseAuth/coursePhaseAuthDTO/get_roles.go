package coursePhaseAuthDTO

type GetCourseRoles struct {
	CourseLecturerRole string `json:"courseLecturerRole"`
	CourseEditorRole   string `json:"courseEditorRole"`
	CustomGroupPrefix  string `json:"customGroupPrefix"`
}
