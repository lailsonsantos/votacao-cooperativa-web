/// <reference types="vite/client" />

/**
 * Variaveis de ambiente da aplicacao.
 */
interface ImportMetaEnv {
  /** URL base da API, sem o sufixo /api/v1. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
