package student

import (
	"errors"
	"regexp"

	"github.com/niclasheun/prompt2.0/student/studentDTO"
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
