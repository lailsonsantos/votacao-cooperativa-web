/**
 * Converte `dd/MM/yyyy` para `yyyy-MM-dd`, formato exigido pelo input nativo.
 *
 * @param valor data no formato do Anexo 1
 * @returns a data em ISO, ou string vazia se o formato não for reconhecido
 */
export function paraIso(valor: string): string {
  const partes = valor.split('/');
  if (partes.length !== 3) return '';
  const [dia, mes, ano] = partes;
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

/**
 * Converte `yyyy-MM-dd` de volta para `dd/MM/yyyy`, formato do Anexo 1.
 *
 * @param valor data em ISO vinda do input nativo
 * @returns a data no formato do Anexo 1, ou string vazia se invalida
 */
export function paraBrasileiro(valor: string): string {
  const partes = valor.split('-');
  if (partes.length !== 3) return '';
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}
