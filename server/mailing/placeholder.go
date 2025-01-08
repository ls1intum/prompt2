package mailing

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/yosssi/gohtml"
)

func replacePlaceholders(template string, values map[string]string) string {
	// Regular expression to find placeholders in the format {{placeholderName}}
	re := regexp.MustCompile(`{{\s*([^{}]+)\s*}}`)
	replacedHTML := re.ReplaceAllStringFunc(template, func(placeholder string) string {
		key := strings.TrimSpace(strings.Trim(placeholder, "{{}}"))
		if val, ok := values[key]; ok {
			return val
		}
		// If the key is not found, keep the placeholder as is
		return placeholder
	})

	// prettify to prevent max line length issues
	return prettifyHTML(replacedHTML)
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
		"applicationEndDate":  formatStringDate(mailingInfo.ApplicationEndDate),
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
		return date.Time.Format("02.01.2006") // go is officially weird !!
	}
	return ""
}

func formatStringDate(dateStr string) string {
	// Parse the timestamp string into a time.Time object
	const inputLayout = time.RFC3339
	const outputLayout = "02-01-2006" // Format for dd-mm-yyyy

	parsedTime, err := time.Parse(inputLayout, dateStr)
	if err != nil {
		// Handle parsing error (return empty string or log error)
		return ""
	}

	// Format the parsed time into dd-mm-yyyy format
	return parsedTime.Format(outputLayout)
}

func prettifyHTML(html string) string {
	return gohtml.Format(html)
}
