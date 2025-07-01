const validGradeValues = [1, 1.3, 1.7, 2, 2.3, 2.7, 3, 3.3, 3.7, 4, 5]

export const validateGrade = (
  gradeString: string,
): { isValid: boolean; value?: number; error?: string } => {
  if (!gradeString || gradeString.trim() === '') {
    return { isValid: true, value: 5.0 } // Default value when empty
  }

  const gradeValue = parseFloat(gradeString)

  if (isNaN(gradeValue)) {
    return { isValid: false, error: 'Grade must be a valid number' }
  }

  if (gradeValue < 1 || gradeValue > 5) {
    return { isValid: false, error: 'Grade must be between 1.0 and 5.0' }
  }

  // Check if the grade matches one of the valid values (with small tolerance for floating point comparison)
  const isValidValue = validGradeValues.some(
    (validValue) => Math.abs(validValue - gradeValue) < 0.01,
  )

  if (!isValidValue) {
    return {
      isValid: false,
      error: `Grade must be one of the predefined values (${validGradeValues.join(', ')})`,
    }
  }

  return { isValid: true, value: gradeValue }
}
