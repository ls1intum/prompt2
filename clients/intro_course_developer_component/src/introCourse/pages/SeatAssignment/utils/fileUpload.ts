/**
 * Parses CSV content into an array of seat names.
 * Splits by newlines and commas, trims each entry, and filters out empty values.
 *
 * @param content - The CSV file content as a string.
 * @returns An array of seat names.
 */
export const parseCSV = (content: string): string[] => {
  return content
    .split(/[\r\n,]+/)
    .map((seat) => seat.trim())
    .filter((seat) => seat.length > 0)
}

/**
 * Reads a CSV file and returns a promise that resolves with the parsed seat names.
 *
 * @param file - The CSV file to read.
 * @returns A promise that resolves to an array of seat names.
 */
export const readCSVFile = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const seatNames = parseCSV(content)
        resolve(seatNames)
      } catch {
        reject(new Error('Failed to parse CSV file. Please check the format.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read the file. Please try again.'))
    }

    reader.readAsText(file)
  })
}
