export type CornerRadius = [number, number, number, number]

export const getCornerRadius = (
  genderData: { gender: string }[],
): [CornerRadius, CornerRadius, CornerRadius] => {
  const R = 4
  let acceptedTop = false,
    acceptedBottom = false
  let rejectedTop = false,
    rejectedBottom = false
  let notAssessedTop = false,
    notAssessedBottom = false

  genderData.forEach((data) => {
    const visible = ['accepted', 'rejected', 'notAssessed'].filter((key) => data[key] > 0)
    if (visible.length) {
      const bottom = visible[0]
      const top = visible[visible.length - 1]
      if (bottom === 'accepted') acceptedBottom = true
      if (top === 'accepted') acceptedTop = true
      if (bottom === 'rejected') rejectedBottom = true
      if (top === 'rejected') rejectedTop = true
      if (bottom === 'notAssessed') notAssessedBottom = true
      if (top === 'notAssessed') notAssessedTop = true
    }
  })

  // Build static corner radius arrays for each series.
  // The array format is [top-left, top-right, bottom-right, bottom-left].
  const radiusAccepted = [
    acceptedTop ? R : 0,
    acceptedTop ? R : 0,
    acceptedBottom ? R : 0,
    acceptedBottom ? R : 0,
  ] as CornerRadius
  const radiusRejected = [
    rejectedTop ? R : 0,
    rejectedTop ? R : 0,
    rejectedBottom ? R : 0,
    rejectedBottom ? R : 0,
  ] as CornerRadius
  const radiusNotAssessed = [
    notAssessedTop ? R : 0,
    notAssessedTop ? R : 0,
    notAssessedBottom ? R : 0,
    notAssessedBottom ? R : 0,
  ] as CornerRadius

  return [radiusAccepted, radiusRejected, radiusNotAssessed]
}
