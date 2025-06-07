package scoreLevelDTO

import (
	"testing"

	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

func TestMapDBScoreLevelToDTO(t *testing.T) {
	tests := []struct {
		name     string
		input    db.ScoreLevel
		expected ScoreLevel
	}{
		{
			name:     "valid very_bad",
			input:    "very_bad",
			expected: ScoreLevelVeryBad,
		},
		{
			name:     "valid bad",
			input:    "bad",
			expected: ScoreLevelBad,
		},
		{
			name:     "valid ok",
			input:    "ok",
			expected: ScoreLevelOk,
		},
		{
			name:     "valid good",
			input:    "good",
			expected: ScoreLevelGood,
		},
		{
			name:     "valid very_good",
			input:    "very_good",
			expected: ScoreLevelVeryGood,
		},
		{
			name:     "invalid empty string",
			input:    "",
			expected: ScoreLevelUnknown,
		},
		{
			name:     "invalid random string",
			input:    "invalid_score",
			expected: ScoreLevelUnknown,
		},
		{
			name:     "invalid numeric value",
			input:    "123",
			expected: ScoreLevelUnknown,
		},
		{
			name:     "invalid special characters",
			input:    "very@bad",
			expected: ScoreLevelUnknown,
		},
		{
			name:     "invalid case sensitivity",
			input:    "VERY_BAD",
			expected: ScoreLevelUnknown,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := MapDBScoreLevelToDTO(tt.input)
			if result != tt.expected {
				t.Errorf("MapDBScoreLevelToDTO(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestScoreLevelConstants(t *testing.T) {
	expectedConstants := map[ScoreLevel]string{
		ScoreLevelVeryBad:  "veryBad",
		ScoreLevelBad:      "bad",
		ScoreLevelOk:       "ok",
		ScoreLevelGood:     "good",
		ScoreLevelVeryGood: "veryGood",
		ScoreLevelUnknown:  "unknown",
	}

	for constant, expectedValue := range expectedConstants {
		if string(constant) != expectedValue {
			t.Errorf("Constant %v should have value %q, but has %q", constant, expectedValue, string(constant))
		}
	}
}
