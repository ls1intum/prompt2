package meta

import (
	"encoding/json"
	"errors"

	log "github.com/sirupsen/logrus"
)

type MetaData map[string]interface{}

func (m MetaData) GetDBModel() ([]byte, error) {
	// if the data is nil, create an empty array to avoid screwing up the database
	if m == nil {
		m = make(map[string]interface{})
	}

	metaDataBytes, err := json.Marshal(m)
	if err != nil {
		errorMessage := "failed to parse meta data stored in database"
		log.Error(errorMessage)
		err = errors.New(errorMessage)
	}

	return metaDataBytes, err
}

func GetMetaDataDTOFromDBModel(metaDataBytes []byte) (MetaData, error) {
	var metaData MetaData

	if len(metaDataBytes) == 0 {
		return metaData, nil
	}

	err := json.Unmarshal(metaDataBytes, &metaData)
	if err != nil {
		errorMessage := "failed to parse sent meta data"
		log.Error(errorMessage)
		err = errors.New(errorMessage)
	}

	return metaData, err
}

func (m MetaData) Length() int {
	return len(m)
}
