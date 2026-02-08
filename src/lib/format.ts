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
