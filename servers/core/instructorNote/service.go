package instructorNote

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/instructorNote/instructorNoteDTO"
)

type InstructorNoteService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var InstructorNoteServiceSingleton *InstructorNoteService

func GetStudentNotes(ctx context.Context) ([]instructorNoteDTO.InstructorNote, error) {
  instructorNotes, err := InstructorNoteServiceSingleton.queries.GetAllStudentNotes(ctx)
  if err != nil {
    return nil, err
  }
  return instructorNoteDTO.InstructorNotesFromDBModelToDTO(instructorNotes)
}

func GetStudentNotesByID(ctx context.Context, id uuid.UUID) ([]instructorNoteDTO.InstructorNote, error) {
  instructorNotes, err := InstructorNoteServiceSingleton.queries.GetStudentNotesForStudent(ctx, id)
  if err != nil {
    return nil, err
  }
  return instructorNoteDTO.InstructorNotesFromDBModelToDTO(instructorNotes)
}

func GetSingleNoteByID(ctx context.Context, id uuid.UUID) (db.Note, error) {
  note, err := InstructorNoteServiceSingleton.queries.GetSingleStudentNoteByID(ctx, id)
  if err != nil {
    return db.Note{}, err
  }
  return note, nil
}

func NewStudentNote(ctx context.Context, studentID uuid.UUID, params instructorNoteDTO.CreateInstructorNote, signedInUserUUID uuid.UUID, authorName string, authorEmail string) (instructorNoteDTO.InstructorNote, error) {

  versionNumber := 0
  noteID := uuid.UUID{}
  rightNow := pgtype.Timestamptz{ Time: time.Now(), Valid: true }

  if (params.New) {
    newNoteId, err := uuid.NewRandom()
    if err != nil {
      return instructorNoteDTO.InstructorNote{}, err
    }
    InstructorNoteServiceSingleton.queries.CreateNote(ctx, db.CreateNoteParams{
      ID: newNoteId,
      ForStudent: studentID,
      Author: signedInUserUUID,
      AuthorName: authorName,
      AuthorEmail: authorEmail,
      DateCreated: rightNow,
      DateDeleted: pgtype.Timestamptz{},
      DeletedBy: pgtype.UUID{},
    })
    noteID = newNoteId
  } else {
    noteID = params.ForNote
    latestVersionNumber, err := InstructorNoteServiceSingleton.queries.GetLatestNoteVersionForNoteId(ctx, params.ForNote)
    if err != nil {
      return instructorNoteDTO.InstructorNote{}, err
    }
    versionNumber = int(latestVersionNumber) + 1
  }

  // Generate a new UUID for the version record
  versionID, err := uuid.NewRandom()
  if err != nil {
    return instructorNoteDTO.InstructorNote{}, err
  }

  _, err = InstructorNoteServiceSingleton.queries.CreateNoteVersion(ctx, db.CreateNoteVersionParams{
    ID: versionID,
    Content: params.Content,
    DateCreated: rightNow,
    VersionNumber: int32(versionNumber),
    ForNote: noteID,
  })
  if err != nil {
    return instructorNoteDTO.InstructorNote{}, err
  }
  return instructorNoteDTO.InstructorNote{}, err

}

func DeleteInstructorNote(ctx context.Context, noteID uuid.UUID, authorID uuid.UUID) (instructorNoteDTO.InstructorNote, error) {
  _, err := InstructorNoteServiceSingleton.queries.DeleteNote(ctx, db.DeleteNoteParams{
    ID: noteID,
    DeletedBy: pgtype.UUID{ Bytes: authorID, Valid: true},
  })
  if err != nil {
    return instructorNoteDTO.InstructorNote{}, err
  }

  // Fetch the deleted note with versions to return to client
  deletedNoteWithVersions, err := InstructorNoteServiceSingleton.queries.GetSingleNoteWithVersionsByID(ctx, noteID)
  if err != nil {
    return instructorNoteDTO.InstructorNote{}, err
  }

  // Convert to DTO
  return instructorNoteDTO.GetInstructorNoteDTOFromDBModel(deletedNoteWithVersions)
}
