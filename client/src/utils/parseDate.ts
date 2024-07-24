export function parseDate(unparsedDate: string): string {
  const dateString = String(unparsedDate)
  const year = Number(dateString.substring(0, 4))
  const month = Number(dateString.substring(5, 7))
  const day = Number(dateString.substring(8, 10))

  return new Date(year, month - 1, day).toDateString()
}
