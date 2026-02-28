import { computed } from "vue"

export const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
] as const

export const MIN_PERIOD_YEAR = 2025
export const MIN_PERIOD_MONTH = 9
export const MIN_PERIOD_STR = "01-09-2025"

export function clampPeriodToMin(period: string): string {
  const parts = period.split("-")
  if (parts.length !== 3) return period
  const [, month, year] = parts
  const y = Number(year)
  const m = Number(month)
  if (y < MIN_PERIOD_YEAR || (y === MIN_PERIOD_YEAR && m < MIN_PERIOD_MONTH)) {
    return MIN_PERIOD_STR
  }
  return period
}

export function monthOptionsForYear(year: string): readonly { value: string; label: string }[] {
  if (year === String(MIN_PERIOD_YEAR)) {
    return MONTHS.filter((m) => Number(m.value) >= MIN_PERIOD_MONTH)
  }
  return MONTHS
}

export function usePeriodYearOptions() {
  return computed(() => {
    const y = new Date().getFullYear()
    return Array.from(
      { length: Math.max(0, y - MIN_PERIOD_YEAR + 1) },
      (_, i) => MIN_PERIOD_YEAR + i,
    )
  })
}
