package applicationAdministration

import (
	"context"
	"errors"
	"fmt"
	"regexp"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func validateUpdateForm(ctx context.Context, coursePhaseID uuid.UUID, updateForm applicationDTO.UpdateForm) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	// Get all questions for the course phase
	applicationQuestionsText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return errors.New("could not validate the application form")
	}

	applicationQuestionsMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return errors.New("could not validate the application form")
	}

	// Transform questions into map for more efficient lockup
	textQuestionsMap := make(map[uuid.UUID]bool)
	for _, question := range applicationQuestionsText {
		textQuestionsMap[question.ID] = true
	}

	multiSelectQuestionsMap := make(map[uuid.UUID]bool)
	for _, question := range applicationQuestionsMultiSelect {
		multiSelectQuestionsMap[question.ID] = true
	}

	// 1. DELETE: Check that all deleted questions are from this course
	for _, question := range updateForm.DeleteQuestionsText {
		if !textQuestionsMap[question] {
			return errors.New("question does not belong to this course")
		}
	}

	for _, question := range updateForm.DeleteQuestionsMultiSelect {
		if !multiSelectQuestionsMap[question] {
			return errors.New("question does not belong to this course")
		}
	}

	// 2. CREATE: The course phase id is correct and the same for all questions
	for _, question := range updateForm.CreateQuestionsText {
		if question.CoursePhaseID != coursePhaseID {
			return errors.New("course phase id is not correct")
		}
		err := validateQuestionText(question.Title, question.ValidationRegex, question.AllowedLength)
		if err != nil {
			return err
		}
	}
	for _, question := range updateForm.CreateQuestionsMultiSelect {
		if question.CoursePhaseID != coursePhaseID {
			return errors.New("course phase id is not correct")
		}
		err := validateQuestionMultiSelect(question.Title, question.MinSelect, question.MaxSelect, question.Options)
		if err != nil {
			return err
		}
	}

	// 3. Update: The course phase id is correct and the same for all questions
	for _, question := range updateForm.UpdateQuestionsText {
		if question.CoursePhaseID != coursePhaseID || !textQuestionsMap[question.ID] {
			return errors.New("course phase id is not correct")
		}
		err := validateQuestionText(question.Title, question.ValidationRegex, question.AllowedLength)
		if err != nil {
			return err
		}
	}

	for _, question := range updateForm.UpdateQuestionsMultiSelect {
		if question.CoursePhaseID != coursePhaseID || !multiSelectQuestionsMap[question.ID] {
			return errors.New("course phase id is not correct")
		}
		err := validateQuestionMultiSelect(question.Title, question.MinSelect, question.MaxSelect, question.Options)
		if err != nil {
			return err
		}
	}

	// 4. TODO:  Validate the correct order of the questions

	return nil
}

func validateQuestionText(title, validationRegex string, allowedLength int) error {
	// Check that the title is not empty
	if len(title) == 0 {
		return errors.New("title is required")
	}

	// Validate allowed length
	if allowedLength < 1 {
		return errors.New("allowed length must be at least 1")
	}

	// Validate the regex pattern (if provided)
	if validationRegex != "" {
		_, err := regexp.Compile(validationRegex)
		if err != nil {
			return fmt.Errorf("invalid regex pattern: %s", validationRegex)
		}
	}

	// No issues, return nil
	return nil
}

func validateQuestionMultiSelect(title string, minSelect, maxSelect int, options []string) error {
	// Check that the title is not empty
	if len(title) == 0 {
		return errors.New("title is required")
	}

	// Validate min_select
	if minSelect < 0 {
		return errors.New("minimum selection must be at least 0")
	}

	// Validate max_select
	if maxSelect < 1 {
		return errors.New("maximum selection must be at least 1")
	}

	// Ensure options are not empty
	if len(options) == 0 {
		return errors.New("options cannot be empty")
	}

	// Validate each option
	for _, option := range options {
		if len(option) == 0 {
			return errors.New("option cannot be an empty string")
		}
	}

	// No issues, return nil
	return nil
}
