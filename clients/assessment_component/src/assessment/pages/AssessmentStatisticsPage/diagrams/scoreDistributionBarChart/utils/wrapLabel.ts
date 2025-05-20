// Utility to wrap text at word boundaries, not exceeding maxLineLength per line
export function wrapLabel(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  for (const word of words) {
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxLen) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      // If word itself is longer than maxLen, break it
      if (word.length > maxLen) {
        let start = 0
        while (start < word.length) {
          lines.push(word.slice(start, start + maxLen))
          start += maxLen
        }
        currentLine = ''
      } else {
        currentLine = word
      }
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}
