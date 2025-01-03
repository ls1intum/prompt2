package coursePhaseParticipationDTO

import db "github.com/niclasheun/prompt2.0/db/sqlc"

func GetPassStatusString(passStatus db.NullPassStatus) string {
	if passStatus.Valid {
		return string(passStatus.PassStatus)
	}
	return string(db.PassStatusNotAssessed)
}
