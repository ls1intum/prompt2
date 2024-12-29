package coursePhaseParticipationDTO

import db "github.com/niclasheun/prompt2.0/db/sqlc"

func getPassStatusString(passStatus db.NullPassStatus) string {
	if passStatus.Valid {
		return string(passStatus.PassStatus)
	}
	return string(db.PassStatusNotAssessed)
}
