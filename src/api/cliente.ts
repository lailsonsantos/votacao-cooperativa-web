import axios from 'axios';

/**
 * Cliente HTTP compartilhado pela aplicação.
 */
export const BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/** Instância do axios com URL base e timeout definidos. */
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
 * Extrai a mensagem de erro do ProblemDetail. O backend já escreve o texto para
 * o usuário final, entao prefiro ele a qualquer mensagem do axios.
 *
 * @param erro erro capturado na chamada
 * @returns mensagem apresentável na interface
 */
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(erro)) {
    const problema = erro.response?.data;
    if (problema?.detail) return problema.detail;
    if (problema?.title) return problema.title;
    if (erro.code === 'ECONNABORTED') {
      return 'A requisição demorou demais. Verifique se a API está no ar.';
    }
    if (!erro.response) {
      return `Nao foi possivel falar com a API em ${BASE_URL}. Ela esta rodando?`;
    }
  }
  return 'Ocorreu um erro inesperado.';
}
