export const formatDate = (value: string | Date): string => {
  const date = new Date(value)

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
