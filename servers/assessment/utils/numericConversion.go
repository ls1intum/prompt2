package utils

import (
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgtype"
)

func MapFloat64ToNumeric(gradeSuggestion float64) pgtype.Numeric {
	var x pgtype.Numeric
	err := x.Scan(fmt.Sprintf("%v", gradeSuggestion))
	if err != nil {
		log.Printf("Error converting float64 to Numeric: %v", err)
		// Return an empty Numeric if conversion fails
		return pgtype.Numeric{}
	}
	return x
}

func MapNumericToFloat64(gradeSuggestion pgtype.Numeric) float64 {
	x, err := gradeSuggestion.Float64Value()
	if err != nil {
		return 0.0 // Return an empty Float8 if conversion fails
	}
	return x.Float64
}
