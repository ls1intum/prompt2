package instructorNote

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/instructorNote/instructorNoteDTO"
)

func ValidateCreateNote(createNoteRequest instructorNoteDTO.CreateInstructorNote) error {
  if !createNoteRequest.New && createNoteRequest.ForNote == uuid.Nil {
    return errors.New("For editing existing notes, a note id must be provided")
  }
  return nil
}


func ValidateReferencedNote(createRequest instructorNoteDTO.CreateInstructorNote, ctx context.Context, SignedInUserID uuid.UUID) error {
  // verify note that is referenced exists,  
  // 'editing' a note should only be doable from the author
  if !createRequest.New {
    note, err := GetSingleNoteByID(ctx, createRequest.ForNote)
    if err != nil {
      return err
    }
    if note.Author != SignedInUserID {
      return errors.New("The user that performed the request is not the author of the InstructorNote")
    }
  }
  return nil
}
