/**
 * Conversao entre o formato de data do Anexo 1 e o do input nativo.
 *
 * O Anexo 1 usa `dd/MM/yyyy` (o exemplo do PDF traz `"01/01/2000"`), enquanto o
 * `<input type="date">` do navegador trabalha exclusivamente com `yyyy-MM-dd`.
 * A conversao vive aqui, e nao dentro do componente, porque o formato faz parte
 * do protocolo com o servidor e nao da renderizacao.
 */

/**
 * Converte `dd/MM/yyyy` para `yyyy-MM-dd`, formato exigido pelo input nativo.
 *
 * @param valor data no formato do Anexo 1
 * @returns a data em ISO, ou string vazia se o formato nao for reconhecido
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
