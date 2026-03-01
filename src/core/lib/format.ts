/**
 * Returns the date in the format DD-MM-YYYY (period).
 * If no arguments, uses the current date. Useful for APIs and filters by period.
 */
export function getFormattedDate(date: Date = new Date()): string {
  return date.toLocaleDateString("pt-BR").replace(/\//g, "-")
}

/**
 * Formats the date string in the format DD-MM-YYYY (hyphen)
 * to the format DD/MM/YYYY (slash).
 * Example: "08-02-2025" → "08/02/2025"
 */
export function formatDateHyphenToSlash(value: string | undefined): string {
  return (value ?? "").replace(/-/g, "/")
}

/** Returns the period for API: always day 01. "08-02-2025" → "01-02-2025" */
export function periodWithFirstDay(period: string): string {
  const parts = (period ?? "").split("-")
  if (parts.length !== 3) return period
  const [, month, year] = parts
  return `01-${month}-${year}`
}

/** Formats the period DD-MM-YYYY as MM/YYYY for display (month/year). */
export function formatPeriodMonthYear(period: string | undefined): string {
  if (!period) return ""
  const parts = period.split("-")
  if (parts.length !== 3) return period
  const [, month, year] = parts
  return `${month}/${year}`
}

/** Formats only digits as Brazilian currency value: "R$ 1.234,56". Zero value becomes "R$ ". Values less than 1 real: "R$ ,50" (no zero to the left). */
export function formatMoneyBR(digitsOnly: string): string {
  const digits = digitsOnly.replace(/\D/g, "").slice(0, 14)
  if (!digits.length) return "R$ "
  if (digits === "0" || /^0+$/.test(digits)) return "R$ "
  const cents = digits.slice(-2).padStart(2, "0")
  const intPart = (digits.slice(0, -2) || "").replace(/^0+/, "") || ""
  const withDots = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
  return withDots ? `R$ ${withDots},${cents}` : `R$ ,${cents}`
}

/** Formats a numeric value (e.g. 150.50) as Brazilian currency "R$ 150,50". */
export function formatMoneyFromNumber(value: number): string {
  if (value === 0) return "R$ 0,00"
  const cents = Math.round(value * 100)
  return formatMoneyBR(String(cents))
}

/** Extracts the numeric value from the formatted string "R$ 1.234,56" */
export function parseMoneyBR(value: string): number {
  const cleaned = value
    .replace(/\s/g, "")
    .replace(/R\$\s?/i, "")
    .replace(/\./g, "")
    .replace(",", ".")
  return Number.isNaN(Number(cleaned)) ? 0 : Number(cleaned)
}
