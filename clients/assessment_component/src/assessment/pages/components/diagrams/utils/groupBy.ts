export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item)
      groups[key] = groups[key] || []
      groups[key].push(item)
      return groups
    },
    {} as Record<K, T[]>,
  )
}
