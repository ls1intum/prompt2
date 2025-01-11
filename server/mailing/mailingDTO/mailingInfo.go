package mailingDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type MailingInfo struct {
	CourseName      string
	CourseStartDate pgtype.Date
	CourseEndDate   pgtype.Date
	MailSubject     string
	MailContent     string
	ReplyToEmail    string
	ReplyToName     string
}

func GetMailingInfoFromFailedMailingInformation(infos db.GetFailedMailingInformationRow) MailingInfo {
	return MailingInfo{
		CourseName:      infos.CourseName,
		CourseStartDate: infos.CourseStartDate,
		CourseEndDate:   infos.CourseEndDate,
		MailSubject:     infos.MailSubject,
		MailContent:     infos.MailContent,
		ReplyToEmail:    infos.ReplyToEmail,
		ReplyToName:     infos.ReplyToName,
	}
}

func GetMailingInfoFromPassedMailingInformation(infos db.GetPassedMailingInformationRow) MailingInfo {
	return MailingInfo{
		CourseName:      infos.CourseName,
		CourseStartDate: infos.CourseStartDate,
		CourseEndDate:   infos.CourseEndDate,
		MailSubject:     infos.MailSubject,
		MailContent:     infos.MailContent,
		ReplyToEmail:    infos.ReplyToEmail,
		ReplyToName:     infos.ReplyToName,
	}
}
