/**
 * Converte string de data no formato dia-mes-ano (separador hífen)
 * para o formato dia/mes/ano (separador barra).
 * Ex.: "08-02-2025" → "08/02/2025"
 */
export function formatDateHyphenToSlash(value: string | undefined): string {
  return (value ?? '').replace(/-/g, '/')
}
