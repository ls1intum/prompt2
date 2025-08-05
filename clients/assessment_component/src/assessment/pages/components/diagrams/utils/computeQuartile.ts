/**
 * Computes the specified quartile value from an array of numbers.
 *
 * @param values - An array of numbers. The function will sort the array in ascending order.
 * @param quartile - The desired quartile to compute, represented as a number between 0 and 1
 *                   (e.g., 0.25 for the first quartile, 0.5 for the median, 0.75 for the third quartile).
 * @returns The computed quartile value.
 *
 * @remarks
 * This function sorts the input array `values` in ascending order before computing the quartile.
 * The function uses linear interpolation to calculate the quartile value when the position
 * is not an integer.
 *
 * @example
 * ```typescript
 * const data = [9, 1, 7, 3, 5];
 * const q1 = computeQuartile(data, 0.25); // First quartile (Q1)
 * const median = computeQuartile(data, 0.5); // Median (Q2)
 * const q3 = computeQuartile(data, 0.75); // Third quartile (Q3)
 * ```
 */
export function computeQuartile(values: number[], quartile: number): number {
  values.sort((a, b) => a - b) // Sort values in ascending order
  const pos = (values.length - 1) * quartile
  const base = Math.floor(pos)
  const rest = pos - base

  const gradeBase = values[base]
  const gradeNext = values[base + 1] ? values[base + 1] : gradeBase

  return gradeBase + rest * (gradeNext - gradeBase)
}
