package coreRequestDTOs

import "github.com/google/uuid"

type CoursePhaseParticipationWithStudent struct {
	CoursePhaseID         uuid.UUID      `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID      `json:"courseParticipationID"`
	PassStatus            string         `json:"passStatus"`
	RestrictedData        map[string]any `json:"restrictedData" gorm:"-"`
	StudentReadableData   map[string]any `json:"studentReadableData" gorm:"-"`
	PrevData              map[string]any `json:"prevData" gorm:"-"`
	Student               GetStudent     `json:"student" gorm:"foreignKey:ID"`
}

type DataResolution struct {
	DTOName       string `json:"dtoName"`
	BaseURL       string `json:"baseURL"`
	EndpointPath  string `json:"endpointPath"`
	CoursePhaseID string `json:"coursePhaseID"`
}

type GetCoursePhaseParticipationsWithResolution struct {
	Participations []CoursePhaseParticipationWithStudent `json:"participations"`
	Resolutions    []DataResolution                      `json:"resolutions"`
}
