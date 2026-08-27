/** Situação de uma sessão de votação. */
export type StatusSessao = 'ABERTA' | 'FECHADA';

/** Desfecho da apuração de uma pauta. */
export type ResultadoApuracao = 'APROVADA' | 'REPROVADA' | 'EMPATE' | 'SEM_VOTOS';

/** Opção de voto. */
export type OpcaoVoto = 'SIM' | 'NAO';

/** Pauta cadastrada. */
export interface Pauta {
  id: string;
  titulo: string;
  descricao: string | null;
  criadaEm: string;
}

/** Sessão de votação de uma pauta. */
export interface Sessao {
  id: string;
  pautaId: string;
  aberturaEm: string;
  fechamentoEm: string;
  status: StatusSessao;
  segundosRestantes: number;
}

/** Apuração dos votos de uma pauta. */
export interface Resultado {
  pautaId: string;
  titulo: string;
  status: StatusSessao;
  /** Verdadeiro enquanto a sessão está aberta: o número ainda pode mudar. */
  parcial: boolean;
  totalVotos: number;
  votosSim: number;
  votosNao: number;
  resultado: ResultadoApuracao;
}

/** Envelope de paginação devolvido pela API. */
export interface Pagina<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
}
