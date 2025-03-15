package seatPlan

func validateSeatNames(seatNames []string) bool {
	seen := make(map[string]bool, len(seatNames))
	for _, name := range seatNames {
		if seen[name] {
			return false
		}
		seen[name] = true
	}
	return true
}
