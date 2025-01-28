package coursePhaseTypeDTO

import (
	"encoding/json"
	"errors"

	log "github.com/sirupsen/logrus"
)

type MetaTypeObject struct {
	Name             string   `json:"name"`
	Type             string   `json:"type"`
	AlternativeNames []string `json:"alternativeNames"`
	// Add other fields as needed
}

func getMetaTypeArrayDTOFromDBModel(metaDataBytes []byte) ([]MetaTypeObject, error) {
	var metaDataArray []MetaTypeObject

	if len(metaDataBytes) == 0 {
		// Return an empty slice instead of nil to avoid potential nil slice issues
		return []MetaTypeObject{}, nil
	}

	err := json.Unmarshal(metaDataBytes, &metaDataArray)
	if err != nil {
		errorMessage := "failed to parse meta data array"
		log.Error(errorMessage, err)
		err = errors.New(errorMessage)
	}

	return metaDataArray, err
}
