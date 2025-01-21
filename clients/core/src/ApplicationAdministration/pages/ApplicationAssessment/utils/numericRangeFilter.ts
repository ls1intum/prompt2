export const numericRangeFilter = (
  rowValue: number | null | undefined,
  filterValue: {
    min?: string
    max?: string
    noScore?: boolean
  },
) => {
  const { min, max, noScore } = filterValue

  // if no score this overrides all other filters
  if (noScore) {
    if (rowValue === null || rowValue === undefined) {
      return true
    } else {
      return false
    }
  }

  if (rowValue == null) {
    return false
  }
  const numericMin = min ? parseFloat(min) : undefined
  const numericMax = max ? parseFloat(max) : undefined

  // If there’s a min value and rowValue < min => fail
  if (numericMin !== undefined && rowValue < numericMin) {
    return false
  }

  // If there’s a max value and rowValue > max => fail
  if (numericMax !== undefined && rowValue > numericMax) {
    return false
  }
  return true
}
