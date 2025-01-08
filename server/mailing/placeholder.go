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
		"firstName":           getPgtypeTextValue(mailingInfo.FirstName),
		"lastName":            getPgtypeTextValue(mailingInfo.LastName),
		"email":               getPgtypeTextValue(mailingInfo.Email),
		"matriculationNumber": getPgtypeTextValue(mailingInfo.MatriculationNumber),
		"universityLogin":     getPgtypeTextValue(mailingInfo.UniversityLogin),
		"studyDegree":         string(mailingInfo.StudyDegree),
		"currentSemester":     getPgtypeInt4Value(mailingInfo.CurrentSemester),
		"studyProgram":        getPgtypeTextValue(mailingInfo.StudyProgram),
		"courseName":          mailingInfo.CourseName,
		"courseStartDate":     getPgtypeDateValue(mailingInfo.CourseStartDate),
		"courseEndDate":       getPgtypeDateValue(mailingInfo.CourseEndDate),
		"applicationEndDate":  mailingInfo.ApplicationEndDate,
		"applicationURL":      url,
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
