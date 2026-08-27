/// <reference types="vite/client" />

/**
 * Variaveis de ambiente da aplicacao.
 *
 * Declaradas aqui para que o TypeScript recuse um `import.meta.env.VITE_TYPO`,
 * que de outra forma seria `any` e falharia silenciosamente em producao.
 */
interface ImportMetaEnv {
  /** URL base da API, sem o sufixo /api/v1. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
