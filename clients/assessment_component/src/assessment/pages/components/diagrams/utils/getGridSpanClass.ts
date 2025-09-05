/**
 * Determines the appropriate CSS grid span class based on the number of items.
 *
 * @param itemCount - The number of items to be displayed in the grid.
 * @returns A string representing the CSS grid span class, which adjusts
 *          the column span based on breakpoints (e.g., `lg`, `xl`, `2xl`).
 *
 * The returned class string follows these rules:
 * - For `itemCount` <= 4: `col-span-1`
 * - For `itemCount` <= 9: `col-span-1 lg:col-span-2`
 * - For `itemCount` > 9: `col-span-1 lg:col-span-2 xl:col-span-4`
 */
export function getGridSpanClass(itemCount: number): string {
  if (itemCount <= 4) return 'col-span-1'

  if (itemCount <= 9) {
    return 'col-span-1 lg:col-span-2'
  }

  return 'col-span-1 lg:col-span-2 2xl:col-span-4'
}
