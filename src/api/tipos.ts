/** Situacao de uma sessao de votacao. */
export type StatusSessao = 'ABERTA' | 'FECHADA';

/** Desfecho da apuracao de uma pauta. */
export type ResultadoApuracao = 'APROVADA' | 'REPROVADA' | 'EMPATE' | 'SEM_VOTOS';

/** Opcao de voto. */
export type OpcaoVoto = 'SIM' | 'NAO';

/** Pauta cadastrada. */
export interface Pauta {
  id: string;
  titulo: string;
  descricao: string | null;
  criadaEm: string;
}

/** Sessao de votacao de uma pauta. */
export interface Sessao {
  id: string;
  pautaId: string;
  aberturaEm: string;
  fechamentoEm: string;
  status: StatusSessao;
  segundosRestantes: number;
}

/** Apuracao dos votos de uma pauta. */
export interface Resultado {
  pautaId: string;
  titulo: string;
  status: StatusSessao;
  /** Verdadeiro enquanto a sessao esta aberta: o numero ainda pode mudar. */
  parcial: boolean;
  totalVotos: number;
  votosSim: number;
  votosNao: number;
  resultado: ResultadoApuracao;
}

/** Envelope de paginacao devolvido pela API. */
export interface Pagina<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
}
