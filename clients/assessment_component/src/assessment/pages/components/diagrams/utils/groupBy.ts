export const groupBy = <T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> => {
  const map = new Map<K, T[]>()

  for (const item of array) {
    const key = keyFn(item)
    const group = map.get(key)

    if (group) {
      group.push(item)
    } else {
      map.set(key, [item])
    }
  }

  return map
}
