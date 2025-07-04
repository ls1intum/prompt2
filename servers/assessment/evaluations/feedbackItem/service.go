package feedbackItem

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/feedbackItem/feedbackItemDTO"
	log "github.com/sirupsen/logrus"
)

type FeedbackItemService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var FeedbackItemServiceSingleton *FeedbackItemService

func GetFeedbackItem(ctx context.Context, feedbackItemID uuid.UUID) (feedbackItemDTO.FeedbackItem, error) {
	feedbackItem, err := FeedbackItemServiceSingleton.queries.GetFeedbackItem(ctx, feedbackItemID)
	if err != nil {
		log.Error("could not get feedback item: ", err)
		return feedbackItemDTO.FeedbackItem{}, errors.New("could not get feedback item")
	}
	return feedbackItemDTO.MapDBFeedbackItemToFeedbackItemDTO(feedbackItem), nil
}

func CreateFeedbackItem(ctx context.Context, req feedbackItemDTO.CreateOrUpdateFeedbackItemRequest) error {
	err := FeedbackItemServiceSingleton.queries.CreateFeedbackItem(ctx, req.GetCreateDBModel())
	if err != nil {
		log.Error("could not create feedback item: ", err)
		return errors.New("could not create feedback item")
	}
	return nil
}

func UpdateFeedbackItem(ctx context.Context, req feedbackItemDTO.CreateOrUpdateFeedbackItemRequest) error {
	err := FeedbackItemServiceSingleton.queries.UpdateFeedbackItem(ctx, req.GetUpdateDBModel())
	if err != nil {
		log.Error("could not update feedback item: ", err)
		return errors.New("could not update feedback item")
	}
	return nil
}

func CreateOrUpdateFeedbackItem(ctx context.Context, req feedbackItemDTO.CreateOrUpdateFeedbackItemRequest) error {
	if req.ID != nil {
		// Update existing feedback item
		return UpdateFeedbackItem(ctx, req)
	} else {
		// Create new feedback item
		return CreateFeedbackItem(ctx, req)
	}
}

func DeleteFeedbackItem(ctx context.Context, feedbackItemID uuid.UUID) error {
	err := FeedbackItemServiceSingleton.queries.DeleteFeedbackItem(ctx, feedbackItemID)
	if err != nil {
		log.Error("could not delete feedback item: ", err)
		return errors.New("could not delete feedback item")
	}
	return nil
}

func ListFeedbackItemsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]feedbackItemDTO.FeedbackItem, error) {
	feedbackItems, err := FeedbackItemServiceSingleton.queries.ListFeedbackItemsForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not list feedback items for course phase: ", err)
		return nil, errors.New("could not list feedback items for course phase")
	}
	return feedbackItemDTO.GetFeedbackItemDTOsFromDBModels(feedbackItems), nil
}

func ListFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]feedbackItemDTO.FeedbackItem, error) {
	feedbackItems, err := FeedbackItemServiceSingleton.queries.ListFeedbackItemsForStudentInPhase(ctx, db.ListFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not list feedback items for student in phase: ", err)
		return nil, errors.New("could not list feedback items for student in phase")
	}
	return feedbackItemDTO.GetFeedbackItemDTOsFromDBModels(feedbackItems), nil
}

func ListFeedbackItemsByAuthorInPhase(ctx context.Context, authorCourseParticipationID, coursePhaseID uuid.UUID) ([]feedbackItemDTO.FeedbackItem, error) {
	feedbackItems, err := FeedbackItemServiceSingleton.queries.ListFeedbackItemsByAuthorInPhase(ctx, db.ListFeedbackItemsByAuthorInPhaseParams{
		AuthorCourseParticipationID: authorCourseParticipationID,
		CoursePhaseID:               coursePhaseID,
	})
	if err != nil {
		log.Error("could not list feedback items by author in phase: ", err)
		return nil, errors.New("could not list feedback items by author in phase")
	}
	return feedbackItemDTO.GetFeedbackItemDTOsFromDBModels(feedbackItems), nil
}

func ListPositiveFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]feedbackItemDTO.FeedbackItem, error) {
	feedbackItems, err := FeedbackItemServiceSingleton.queries.ListPositiveFeedbackItemsForStudentInPhase(ctx, db.ListPositiveFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not list positive feedback items for student in phase: ", err)
		return nil, errors.New("could not list positive feedback items for student in phase")
	}
	return feedbackItemDTO.GetFeedbackItemDTOsFromDBModels(feedbackItems), nil
}

func ListNegativeFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) ([]feedbackItemDTO.FeedbackItem, error) {
	feedbackItems, err := FeedbackItemServiceSingleton.queries.ListNegativeFeedbackItemsForStudentInPhase(ctx, db.ListNegativeFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not list negative feedback items for student in phase: ", err)
		return nil, errors.New("could not list negative feedback items for student in phase")
	}
	return feedbackItemDTO.GetFeedbackItemDTOsFromDBModels(feedbackItems), nil
}

func CountFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (int64, error) {
	count, err := FeedbackItemServiceSingleton.queries.CountFeedbackItemsForStudentInPhase(ctx, db.CountFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not count feedback items for student in phase: ", err)
		return 0, errors.New("could not count feedback items for student in phase")
	}
	return count, nil
}

func CountPositiveFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (int64, error) {
	count, err := FeedbackItemServiceSingleton.queries.CountPositiveFeedbackItemsForStudentInPhase(ctx, db.CountPositiveFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not count positive feedback items for student in phase: ", err)
		return 0, errors.New("could not count positive feedback items for student in phase")
	}
	return count, nil
}

func CountNegativeFeedbackItemsForStudentInPhase(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (int64, error) {
	count, err := FeedbackItemServiceSingleton.queries.CountNegativeFeedbackItemsForStudentInPhase(ctx, db.CountNegativeFeedbackItemsForStudentInPhaseParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not count negative feedback items for student in phase: ", err)
		return 0, errors.New("could not count negative feedback items for student in phase")
	}
	return count, nil
}

func IsFeedbackItemAuthor(ctx context.Context, feedbackItemID, authorID uuid.UUID) bool {
	feedbackItem, err := FeedbackItemServiceSingleton.queries.GetFeedbackItem(ctx, feedbackItemID)
	if err != nil {
		log.Error("Error fetching feedback item: ", err)
		return false
	}

	return feedbackItem.AuthorCourseParticipationID == authorID
}
