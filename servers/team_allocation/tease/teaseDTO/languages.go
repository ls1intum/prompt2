package teaseDTO

type Language struct {
	Language    string              `json:"language"`
	Proficiency LanguageProficiency `json:"proficiency"`
}

type LanguageProficiency string

const (
	A1A2   LanguageProficiency = "A1/A2"
	B1B2   LanguageProficiency = "B1/B2"
	C1C2   LanguageProficiency = "C1/C2"
	NATIVE LanguageProficiency = "Native"
)
