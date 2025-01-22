package meta

import (
	"encoding/json"
	"errors"

	log "github.com/sirupsen/logrus"
)

type MetaRequirement struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type MetaRequirements []MetaRequirement

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
