import axios from 'axios';

/**
 * Cliente HTTP compartilhado pela aplicacao.
 *
 * A URL base vem de variavel de ambiente e nao do codigo: o mesmo build precisa
 * funcionar em desenvolvimento, em rede local (para abrir de um celular) e na
 * nuvem. E o espelho, no frontend, da mesma decisao que o backend tomou para as
 * URLs de callback das telas.
 */
export const BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/** Instancia do axios com URL base e timeout definidos. */
export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Formato de erro da API, conforme RFC 7807.
 */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  correlationId?: string;
}

/**
 * Extrai uma mensagem legivel de um erro de requisicao.
 *
 * O backend devolve ProblemDetail com `detail` ja escrito para o usuario final,
 * entao a regra e preferir esse texto a qualquer mensagem tecnica do axios. Uma
 * mensagem como "Request failed with status code 409" nao ajuda ninguem.
 *
 * @param erro erro capturado na chamada
 * @returns mensagem apresentavel na interface
 */
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(erro)) {
    const problema = erro.response?.data;
    if (problema?.detail) return problema.detail;
    if (problema?.title) return problema.title;
    if (erro.code === 'ECONNABORTED') {
      return 'A requisicao demorou demais. Verifique se a API esta no ar.';
    }
    if (!erro.response) {
      return `Nao foi possivel falar com a API em ${BASE_URL}. Ela esta rodando?`;
    }
  }
  return 'Ocorreu um erro inesperado.';
}
