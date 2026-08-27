import { api } from './cliente';
import type { OpcaoVoto, Pagina, Pauta, Resultado, Sessao } from './tipos';

/**
 * Funções de acesso a API REST v1.
 */

/**
 * Lista as pautas cadastradas.
 *
 * @param pagina indice da pagina, iniciando em zero
 * @param tamanho quantidade de itens por pagina
 * @returns a pagina de pautas
 */
export async function listarPautas(pagina = 0, tamanho = 20): Promise<Pagina<Pauta>> {
  const { data } = await api.get<Pagina<Pauta>>('/pautas', {
    params: { page: pagina, size: tamanho },
  });
  return data;
}

/**
 * Detalha uma pauta.
 *
 * @param id identificador da pauta
 * @returns a pauta encontrada
 */
export async function buscarPauta(id: string): Promise<Pauta> {
  const { data } = await api.get<Pauta>(`/pautas/${id}`);
  return data;
}

/**
 * Cadastra uma nova pauta.
 *
 * @param titulo título da pauta
 * @param descricao descrição opcional
 * @returns a pauta criada
 */
export async function criarPauta(titulo: string, descricao: string): Promise<Pauta> {
  const { data } = await api.post<Pauta>('/pautas', { titulo, descricao });
  return data;
}

/**
 * Abre a sessão de votação de uma pauta.
 *
 * @param pautaId identificador da pauta
 * @param duracaoMinutos duração desejada. Omitido, o corpo segue sem a
 *                       propriedade e o servidor aplica o próprio padrão —
 *                       o valor desse padrão e decisao do backend
 *
 * @returns a sessão aberta
 */
export async function abrirSessao(
  pautaId: string,
  duracaoMinutos?: number,
): Promise<Sessao> {
  const { data } = await api.post<Sessao>(`/pautas/${pautaId}/sessao`, {
    duracaoMinutos,
  });
  return data;
}

/**
 * Consulta a sessão de uma pauta.
 *
 * @param pautaId identificador da pauta
 * @returns a sessão, ou null se ainda não existir
 */
export async function consultarSessao(pautaId: string): Promise<Sessao | null> {
  try {
    const { data } = await api.get<Sessao>(`/pautas/${pautaId}/sessao`);
    return data;
  } catch (erro) {
    if (isStatus(erro, 409)) return null;
    throw erro;
  }
}

/**
 * Registra o voto de um associado.
 *
 * @param pautaId identificador da pauta
 * @param associadoId CPF do associado
 * @param opcao opção escolhida
 */
export async function votar(
  pautaId: string,
  associadoId: string,
  opcao: OpcaoVoto,
): Promise<void> {
  await api.post(`/pautas/${pautaId}/votos`, { associadoId, opcao });
}

/**
 * Apura o resultado de uma pauta.
 *
 * @param pautaId identificador da pauta
 * @returns o resultado, ou null se a pauta ainda não teve sessão
 */
export async function apurar(pautaId: string): Promise<Resultado | null> {
  try {
    const { data } = await api.get<Resultado>(`/pautas/${pautaId}/resultado`);
    return data;
  } catch (erro) {
    if (isStatus(erro, 409)) return null;
    throw erro;
  }
}

/**
 * Verifica se um erro de requisição carrega um status HTTP especifico.
 *
 * @param erro erro capturado
 * @param status status procurado
 * @returns true quando o erro corresponde ao status
 */
function isStatus(erro: unknown, status: number): boolean {
  return (
    typeof erro === 'object' &&
    erro !== null &&
    'response' in erro &&
    (erro as { response?: { status?: number } }).response?.status === status
  );
}
