package coursePhaseTypeDTO

import (
	"encoding/json"
	"errors"

	log "github.com/sirupsen/logrus"
)

type MetaRequirement struct {
	Name             string   `json:"name"`
	Type             string   `json:"type"`
	AlternativeNames []string `json:"alternativeNames"`
	// Add other fields as needed
}

type MetaRequirements []MetaRequirement

func getMetaTypeArrayDTOFromDBModel(metaDataBytes []byte) ([]MetaRequirement, error) {
	var metaDataArray []MetaRequirement

	if len(metaDataBytes) == 0 {
		// Return an empty slice instead of nil to avoid potential nil slice issues
		return []MetaRequirement{}, nil
	}

	err := json.Unmarshal(metaDataBytes, &metaDataArray)
	if err != nil {
		errorMessage := "failed to parse meta data array"
		log.Error(errorMessage, err)
		err = errors.New(errorMessage)
	}

	return metaDataArray, err
}

func (m MetaRequirements) GetDBModel() ([]byte, error) {
	// if the data is nil, create an empty array to avoid screwing up the database
	if m == nil {
		m = make([]MetaRequirement, 0)
	}

	metaDataBytes, err := json.Marshal(m)
	if err != nil {
		errorMessage := "failed to parse meta data stored in database"
		log.Error(errorMessage)
		err = errors.New(errorMessage)
	}

	return metaDataBytes, err
}
