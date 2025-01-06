package applicationAdministration

import (
	"context"
	"errors"
	"fmt"
	"regexp"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/student"
	log "github.com/sirupsen/logrus"
)

func validateUpdateForm(ctx context.Context, coursePhaseID uuid.UUID, updateForm applicationDTO.UpdateForm) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	// Check if course phase is application phase
	isApplicationPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error("could not validate application form: ", err)
		return errors.New("could not validate the application form")
	}
	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	// Get all questions for the course phase
	applicationQuestionsText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error("could not validate application form: ", err)
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
	for _, questionID := range updateForm.DeleteQuestionsText {
		if !textQuestionsMap[questionID] {
			return errors.New("question does not belong to this course")
		}
	}

	for _, questionID := range updateForm.DeleteQuestionsMultiSelect {
		if !multiSelectQuestionsMap[questionID] {
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

	if maxSelect < minSelect {
		return errors.New("maximum selection must be greater than or equal to minimum selection")
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

func validateApplicationManualAdd(ctx context.Context, coursePhaseID uuid.UUID, application applicationDTO.PostApplication) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	// Check if course phase is application phase
	// But we don't check if it's open, since we're manually adding an application
	isApplicationPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error("could not validate application: ", err)
		return errors.New("could not validate the application")
	}
	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	return validateAnswers(ctx, coursePhaseID, application)
}

func validateApplication(ctx context.Context, coursePhaseID uuid.UUID, application applicationDTO.PostApplication) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	// Check if course phase is application phase
	isApplicationPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsOpenApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error("could not validate application: ", err)
		return errors.New("could not validate the application. the application deadline might have passed")
	}
	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	return validateAnswers(ctx, coursePhaseID, application)
}

func validateAnswers(ctx context.Context, coursePhaseID uuid.UUID, application applicationDTO.PostApplication) error {
	// 1. Check that the student is valid
	err := student.Validate(application.Student)
	if err != nil {
		return errors.New("invalid student")
	}

	// 2. Get all questions for the course phase
	applicationQuestionsText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not validate application: ", err)
		return errors.New("could not validate the application")
	}

	applicationQuestionsMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		return errors.New("could not validate the application")
	}

	// 3. Validate all the answers
	err = validateTextAnswers(applicationQuestionsText, application.AnswersText)
	if err != nil {
		return err
	}

	err = validateMultiSelectAnswers(applicationQuestionsMultiSelect, application.AnswersMultiSelect)
	if err != nil {
		return err
	}

	return nil
}

func validateTextAnswers(textQuestions []db.ApplicationQuestionText, textAnswers []applicationDTO.CreateAnswerText) error {
	answerMap := make(map[uuid.UUID]string, len(textAnswers))
	for _, answer := range textAnswers {
		answerMap[answer.ApplicationQuestionID] = answer.Answer
	}

	for _, question := range textQuestions {
		answer, exists := answerMap[question.ID]
		if question.IsRequired.Bool && (!exists || len(answer) == 0) {
			return fmt.Errorf("required question %s is not answered", question.ID)
		}
		if question.ValidationRegex.String != "" && exists && !regexp.MustCompile(question.ValidationRegex.String).MatchString(answer) {
			return fmt.Errorf("answer to question %s does not match validation regex", question.ID)
		}
		if exists && len(answer) > int(question.AllowedLength.Int32) {
			return fmt.Errorf("answer to question %s exceeds allowed length of %d", question.ID, question.AllowedLength.Int32)
		}
	}

	questionMap := make(map[uuid.UUID]db.ApplicationQuestionText, len(textQuestions))
	for _, question := range textQuestions {
		questionMap[question.ID] = question
	}
	for _, answer := range textAnswers {
		_, exists := questionMap[answer.ApplicationQuestionID]
		if !exists {
			return fmt.Errorf("answer to question %s does not belong to this course", answer.ApplicationQuestionID)
		}
	}
	return nil
}

func validateMultiSelectAnswers(multiSelectQuestions []db.ApplicationQuestionMultiSelect, multiSelectAnswers []applicationDTO.CreateAnswerMultiSelect) error {
	// Create a map of answers for quick lookup
	answerMap := make(map[uuid.UUID]applicationDTO.CreateAnswerMultiSelect, len(multiSelectAnswers))
	for _, answer := range multiSelectAnswers {
		answerMap[answer.ApplicationQuestionID] = answer
	}

	// Validate multi select questions
	for _, question := range multiSelectQuestions {
		answer, exists := answerMap[question.ID]
		if (question.IsRequired.Bool || question.MinSelect.Int32 > 0) && !exists {
			return fmt.Errorf("required question %s is not answered", question.ID)
		}
		if exists {
			if len(answer.Answer) < int(question.MinSelect.Int32) || len(answer.Answer) > int(question.MaxSelect.Int32) {
				return fmt.Errorf("answer to question %s does not meet selection requirements", question.ID)
			}
			for _, selection := range answer.Answer {
				if !contains(question.Options, selection) {
					return fmt.Errorf("invalid selection %s for question %s", selection, question.ID)
				}
			}
		}
	}

	questionMap := make(map[uuid.UUID]db.ApplicationQuestionMultiSelect, len(multiSelectQuestions))
	for _, question := range multiSelectQuestions {
		questionMap[question.ID] = question
	}
	for _, answer := range multiSelectAnswers {
		_, exists := questionMap[answer.ApplicationQuestionID]
		if !exists {
			return fmt.Errorf("answer to question %s does not belong to this course", answer.ApplicationQuestionID)
		}
	}
	return nil
}

func contains(options []string, selection string) bool {
	for _, option := range options {
		if option == selection {
			return true
		}
	}
	return false
}

func validateUpdateAssessment(ctx context.Context, coursePhaseID, coursePhaseParticipationID uuid.UUID, assessment applicationDTO.PutAssessment) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	// Check if course phase is assessment phase
	isAssessmentPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error("could not validate assessment: ", err)
		return errors.New("could not validate the assessment")
	}
	if !isAssessmentPhase {
		return errors.New("course phase is not an assessment phase")
	}

	isCorrectParticipation, err := ApplicationServiceSingleton.queries.CheckCoursePhaseParticipationPair(ctxWithTimeout, db.CheckCoursePhaseParticipationPairParams{
		ID:            coursePhaseParticipationID,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error("could not validate assessment: ", err)
		return errors.New("could not validate the assessment")
	}
	if !isCorrectParticipation {
		return errors.New("course phase participation does not belong to this course phase")
	}

	// Check if the score is valid
	if assessment.MetaData != nil {
		for key := range assessment.MetaData {
			if key != "comments" {
				return errors.New("invalid meta data key - not allowed to update other meta data")
			}
		}
	}
	return nil
}

func validateAdditionalScore(score applicationDTO.AdditionalScore) error {
	// Check if the name is empty
	if score.Name == "" {
		return errors.New("name cannot be empty")
	}

	// Check if all scores are greater than 0
	for _, individualScore := range score.Scores {
		if !individualScore.Score.Valid {
			return errors.New("failed to parse score for entry")
		}

		scoreValue, err := individualScore.Score.Float64Value()
		if err != nil {
			return errors.New("failed to parse score for entry")
		}
		if scoreValue.Float64 <= 0 {
			return errors.New("scores must be greater than 0")
		}
	}

	return nil
}
