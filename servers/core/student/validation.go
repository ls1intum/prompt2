package student

import (
	"context"
	"errors"
	"regexp"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/student/studentDTO"
	log "github.com/sirupsen/logrus"
)

func Validate(c studentDTO.CreateStudent) error {
	if err := validateName(c.FirstName, c.LastName); err != nil {
		return err
	}
	if err := validateEmail(c.Email); err != nil {
		return err
	}
	if err := validateUniversityData(c.HasUniversityAccount, c.MatriculationNumber, c.UniversityLogin); err != nil {
		return err
	}
	if c.Nationality == "" {
		log.Error("nationality is missing")
		return errors.New("nationality is missing")
	}

	if !c.CurrentSemester.Valid || c.CurrentSemester.Int32 < 1 {
		log.Error("semester is invalid")
		return errors.New("semester is invalid")
	}
	if c.StudyProgram == "" {
		log.Error("study program is invalid")
		return errors.New("study program is invalid")
	}
	if c.StudyDegree != db.StudyDegreeBachelor && c.StudyDegree != db.StudyDegreeMaster {
		log.Error("study degree is invalid")
		return errors.New("study degree is invalid")
	}
	return nil
}

func validateName(firstName, lastName string) error {
	if firstName == "" {
		log.Error("first name is required")
		return errors.New("first name is required")
	}
	if lastName == "" {
		log.Error("last name is required")
		return errors.New("last name is required")
	}
	return nil
}

func validateEmail(email string) error {
	emailRegex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

	if matched, _ := regexp.MatchString(emailRegex, email); !matched {
		return errors.New("invalid email address")
	}

	return nil
}

func validateUniversityData(hasUniversityAccount bool, matriculationNumber, universityLogin string) error {
	if hasUniversityAccount {
		// Schema for TUM matriculation number
		matriculationNumberRegex := `^0\d{7}$`

		// Schema for TUM ID
		universityLoginRegex := `^[a-zA-Z]{2}\d{2}[a-zA-Z]{3}$`

		if matched, _ := regexp.MatchString(matriculationNumberRegex, matriculationNumber); !matched {
			return errors.New("invalid matriculation number")
		}

		if matched, _ := regexp.MatchString(universityLoginRegex, universityLogin); !matched {
			return errors.New("invalid university login")
		}
	} else if matriculationNumber != "" || universityLogin != "" {
		return errors.New("student has no university account but has university data")
	}

	return nil
}


func ValidateCreateNote(createNoteRequest studentDTO.CreateInstructorNote) error {
  if !createNoteRequest.New && createNoteRequest.ForNote == uuid.Nil {
    return errors.New("For editing existing notes, a note id must be provided")
  }
  return nil
}


func ValidateReferencedNote(createRequest studentDTO.CreateInstructorNote, ctx context.Context, SignedInUserID uuid.UUID) error {
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
