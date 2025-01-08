package mailing

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func replacePlaceholders(template string, values map[string]string) string {
	// Regular expression to find placeholders in the format {{placeholderName}}
	re := regexp.MustCompile(`{{\s*([^{}]+)\s*}}`)
	return re.ReplaceAllStringFunc(template, func(placeholder string) string {
		key := strings.TrimSpace(strings.Trim(placeholder, "{{}}"))
		if val, ok := values[key]; ok {
			return val
		}
		// If the key is not found, keep the placeholder as is
		return placeholder
	})
}

func getPlaceholderValues(mailingInfo db.GetConfirmationMailingInformationRow, url string) map[string]string {
	return map[string]string{
		"student.firstName":           getPgtypeTextValue(mailingInfo.FirstName),
		"student.lastName":            getPgtypeTextValue(mailingInfo.LastName),
		"student.email":               getPgtypeTextValue(mailingInfo.Email),
		"student.matriculationNumber": getPgtypeTextValue(mailingInfo.MatriculationNumber),
		"student.universityLogin":     getPgtypeTextValue(mailingInfo.UniversityLogin),
		"student.studyDegree":         string(mailingInfo.StudyDegree),
		"student.currentSemester":     getPgtypeInt4Value(mailingInfo.CurrentSemester),
		"student.studyProgram":        getPgtypeTextValue(mailingInfo.StudyProgram),
		"courseName":                  mailingInfo.CourseName,
		"courseStartDate":             getPgtypeDateValue(mailingInfo.CourseStartDate),
		"courseEndDate":               getPgtypeDateValue(mailingInfo.CourseEndDate),
		"applicationURL":              url,
	}
}

func getPgtypeTextValue(text pgtype.Text) string {
	if text.Valid {
		return text.String
	}
	return ""
}

func getPgtypeInt4Value(int4 pgtype.Int4) string {
	if int4.Valid {
		return strconv.Itoa(int(int4.Int32))
	}
	return ""
}

func getPgtypeDateValue(date pgtype.Date) string {
	if date.Valid {
		return date.Time.Format("DD-MM-YYYY")
	}
	return ""
}
