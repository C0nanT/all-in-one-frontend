/**
 * Retorna a data no formato DD-MM-YYYY (período).
 * Sem argumentos, usa a data de hoje. Útil para APIs e filtros por período.
 */
export function getFormattedDate(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR').replace(/\//g, '-')
}

/**
 * Converte string de data no formato dia-mes-ano (separador hífen)
 * para o formato dia/mes/ano (separador barra).
 * Ex.: "08-02-2025" → "08/02/2025"
 */
export function formatDateHyphenToSlash(value: string | undefined): string {
  return (value ?? '').replace(/-/g, '/')
}

/** Formata apenas dígitos como valor em reais: "R$ 1.234,56". Valor zero fica "R$ ". Valores menores que 1 real: "R$ ,50" (sem zero à esquerda). */
export function formatMoneyBR(digitsOnly: string): string {
  const digits = digitsOnly.replace(/\D/g, '').slice(0, 14)
  if (!digits.length) return 'R$ '
  if (digits === '0' || /^0+$/.test(digits)) return 'R$ '
  const cents = digits.slice(-2).padStart(2, '0')
  const intPart = (digits.slice(0, -2) || '').replace(/^0+/, '') || ''
  const withDots = intPart
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : ''
  return withDots ? `R$ ${withDots},${cents}` : `R$ ,${cents}`
}

/** Extrai valor numérico de string formatada "R$ 1.234,56" */
export function parseMoneyBR(value: string): number {
  const cleaned = value.replace(/\s/g, '').replace(/R\$\s?/i, '').replace(/\./g, '').replace(',', '.')
  return Number.isNaN(Number(cleaned)) ? 0 : Number(cleaned)
}
