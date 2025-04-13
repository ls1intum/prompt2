package teaseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	log "github.com/sirupsen/logrus"
)

const (
	KEY_LANGUAGE_EN = "language_proficiency_english"
	KEY_LANGUAGE_DE = "language_proficiency_german"
)

// Student is the TEASE representation of a student's data.
type Student struct {
	CourseParticipationID  uuid.UUID           `json:"id"` // use the coursePhaseID, though in TEASE it's called StudentID
	FirstName              string              `json:"firstName"`
	LastName               string              `json:"lastName"`
	Gender                 string              `json:"gender"`
	Nationality            string              `json:"nationality"`
	Email                  string              `json:"email"`
	StudyDegree            string              `json:"studyDegree"`
	StudyProgram           string              `json:"studyProgram"`
	Semester               pgtype.Int4         `json:"semester"`
	Languages              []Language          `json:"languages"`
	IntroSelfAssessment    string              `json:"introSelfAssessment"`
	IntroCourseProficiency string              `json:"introCourseProficiency"`
	Skill                  []SkillResponse     `json:"skill"`
	Devices                []string            `json:"devices"`
	StudentComments        string              `json:"studentComments"` // @rappm pls update once your assessment is done
	TutorComments          string              `json:"tutorComments"`   // @rappm pls update once your assessment is done
	ProjectPreferences     []ProjectPreference `json:"projectPreferences"`
}

// convertPromptGenderToTease maps the promptSDK gender to TEASE gender labels.
func convertPromptGenderToTease(gender promptTypes.Gender) string {
	switch gender {
	case promptTypes.GenderFemale:
		return "Female"
	case promptTypes.GenderMale:
		return "Male"
	case promptTypes.GenderDiverse:
		return "Other"
	case promptTypes.GenderPreferNotToSay:
		return "Prefer not to say"
	default:
		return "Unknown"
	}
}

// ConvertCourseParticipationToTeaseStudent transforms a promptSDK course participation
// into a TEASE-compatible Student struct.
func ConvertCourseParticipationToTeaseStudent(
	cp promptTypes.CoursePhaseParticipationWithStudent,
	projectPreferences []ProjectPreference,
	skillResponses []SkillResponse,
) (Student, error) {
	// 1) Read the application answers from meta data
	_, multiSelectAnswers, err := promptTypes.ReadApplicationAnswersFromMetaData(cp.PrevData["applicationAnswers"])
	if err != nil {
		log.WithField("courseParticipationID", cp.CourseParticipationID).
			WithError(err).
			Error("Could not read application answers from metadata")
		return Student{}, err
	}

	// 2) Attempt to read the "devices" field as []string
	devices, ok := cp.PrevData["devices"].([]string)
	if !ok {
		log.WithField("courseParticipationID", cp.CourseParticipationID).
			Error("Field 'devices' in PrevData is not []string; using empty slice")
		devices = []string{}
	}

	// 3) Build a Student object
	student := Student{
		CourseParticipationID: cp.CourseParticipationID,
		FirstName:             cp.Student.FirstName,
		LastName:              cp.Student.LastName,
		Gender:                convertPromptGenderToTease(cp.Student.Gender),
		Nationality:           cp.Student.Nationality,
		Email:                 cp.Student.Email,
		StudyDegree:           string(cp.Student.StudyDegree),
		StudyProgram:          cp.Student.StudyProgram,
		Semester:              cp.Student.CurrentSemester,
		Languages:             []Language{},
		Devices:               devices,
		Skill:                 skillResponses,
		ProjectPreferences:    projectPreferences,
		// IntroSelfAssessment, IntroCourseProficiency, StudentComments,
		// TutorComments can be added when needed
	}

	// 4) Process multi-select answers for language proficiency
	for _, ans := range multiSelectAnswers {
		switch ans.Key {
		case KEY_LANGUAGE_EN:
			addLanguageProficiency(&student, cp, ans, "en")
		case KEY_LANGUAGE_DE:
			addLanguageProficiency(&student, cp, ans, "de")
		}
	}

	return student, nil
}

// addLanguageProficiency is a helper that checks that the multi-select answer
// has exactly one item, and then appends it to the student's Languages slice.
func addLanguageProficiency(
	stud *Student,
	cp promptTypes.CoursePhaseParticipationWithStudent,
	answer promptTypes.AnswersMultiSelect,
	langCode string,
) {
	if len(answer.Answer) != 1 {
		log.WithField("courseParticipationID", cp.CourseParticipationID).
			WithField("key", answer.Key).
			Error("Unexpected number of answers for language proficiency: ", answer.Answer)
		return
	}
	proficiency := LanguageProficiency(answer.Answer[0])
	stud.Languages = append(stud.Languages, Language{
		Language:    langCode,
		Proficiency: proficiency,
	})
}
