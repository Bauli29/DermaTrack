/**
 * Formats a Date as yyyy-MM-dd suitable for <input type="date"/>
 * Keeps leading zeros for month and day.
 */
export const formatDateInput = (d: Date): string => {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}
