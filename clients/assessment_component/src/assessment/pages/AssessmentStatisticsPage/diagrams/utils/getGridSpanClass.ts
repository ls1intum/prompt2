/**
 * Generates responsive grid column classes based on the number of columns (charts) to display.
 * The function optimizes layout across different screen sizes:
 * - sm: up to 2 columns
 * - md: up to 2 columns
 * - lg: up to 3 columns
 * - xl: up to 3 columns
 * - 2xl: up to 4 columns
 *
 * @param colCount - Number of items to display in the grid
 * @returns Tailwind CSS class string with responsive grid columns
 */
export function getGridSpanClass(colCount: number): string {
  if (colCount <= 4) return 'col-span-1'

  if (colCount <= 8) {
    return 'col-span-1 lg:col-span-2'
  }

  if (colCount <= 12) {
    return 'col-span-1 lg:col-span-2'
  }

  if (colCount <= 16) {
    return 'col-span-1 lg:col-span-2 xl:col-span-3'
  }

  if (colCount <= 20) {
    return 'col-span-1 lg:col-span-2 xl:col-span-3 2xl:col-span-4'
  }

  return 'col-span-1 lg:col-span-2 xl:col-span-3 2xl:col-span-4'
}
