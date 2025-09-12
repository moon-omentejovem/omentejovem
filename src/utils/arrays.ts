export function orderBy<T>(
  list: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...list].sort((a, b) => {
    if (a[key] > b[key]) {
      return order === 'asc' ? 1 : -1
    }

    if (a[key] < b[key]) {
      return order === 'asc' ? -1 : 1
    }

    return 0
  })
}

export function shuffle<T>(list: T[]): T[] {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
