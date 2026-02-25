package instructorNoteDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type NoteTag struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type CreateNoteTag struct {
	Name string `json:"name"`
}

func NoteTagFromDBModel(model db.NoteTag) NoteTag {
	return NoteTag{
		ID:   model.ID,
		Name: model.Name,
	}
}

func NoteTagsFromDBModels(models []db.NoteTag) []NoteTag {
	tags := make([]NoteTag, 0, len(models))
	for _, m := range models {
		tags = append(tags, NoteTagFromDBModel(m))
	}
	return tags
}
