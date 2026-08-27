import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  abrirSessao,
  apurar,
  consultarSessao,
  criarPauta,
  listarPautas,
  votar,
} from '../api/pautas';
import type { OpcaoVoto } from '../api/tipos';

/**
 * Hooks de acesso a API REST para o painel administrativo.
 *
 * O React Query cuida de cache, revalidacao e estados de carga. A alternativa —
 * `useEffect` com `useState` — exigiria reimplementar tudo isso a mao em cada
 * componente, e e onde nascem os bugs de tela desatualizada apos uma acao.
 */

/** Chaves de cache, centralizadas para que a invalidacao nunca erre o alvo. */
export const chaves = {
  pautas: ['pautas'] as const,
  sessao: (id: string) => ['sessao', id] as const,
  resultado: (id: string) => ['resultado', id] as const,
};

/**
 * Lista as pautas cadastradas.
 *
 * @returns o resultado da consulta paginada
 */
export function usePautas() {
  return useQuery({
    queryKey: chaves.pautas,
    queryFn: () => listarPautas(0, 50),
  });
}

/**
 * Consulta a sessao de uma pauta, atualizando enquanto ela estiver aberta.
 *
 * O `refetchInterval` condicional e o ponto central: enquanto a sessao esta
 * aberta, o contador precisa acompanhar o tempo real; depois do fechamento,
 * continuar consultando seria trafego inutil.
 *
 * @param pautaId identificador da pauta, ou null para desabilitar a consulta
 * @returns o resultado da consulta da sessao
 */
export function useSessao(pautaId: string | null) {
  return useQuery({
    queryKey: chaves.sessao(pautaId ?? ''),
    queryFn: () => consultarSessao(pautaId!),
    enabled: Boolean(pautaId),
    refetchInterval: (consulta) =>
      consulta.state.data?.status === 'ABERTA' ? 1_000 : false,
  });
}

/**
 * Apura o resultado de uma pauta, atualizando enquanto a votacao acontece.
 *
 * @param pautaId identificador da pauta, ou null para desabilitar a consulta
 * @returns o resultado da apuracao
 */
export function useResultado(pautaId: string | null) {
  return useQuery({
    queryKey: chaves.resultado(pautaId ?? ''),
    queryFn: () => apurar(pautaId!),
    enabled: Boolean(pautaId),
    refetchInterval: (consulta) => (consulta.state.data?.parcial ? 2_000 : false),
  });
}

/**
 * Cadastra uma nova pauta e atualiza a listagem.
 *
 * @returns a mutacao de criacao de pauta
 */
export function useCriarPauta() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ titulo, descricao }: { titulo: string; descricao: string }) =>
      criarPauta(titulo, descricao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: chaves.pautas }),
  });
}

/**
 * Abre a sessao de votacao de uma pauta.
 *
 * @returns a mutacao de abertura de sessao
 */
export function useAbrirSessao() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ pautaId, duracao }: { pautaId: string; duracao?: number }) =>
      abrirSessao(pautaId, duracao),
    onSuccess: (_, variaveis) => {
      void cliente.invalidateQueries({ queryKey: chaves.sessao(variaveis.pautaId) });
      void cliente.invalidateQueries({ queryKey: chaves.resultado(variaveis.pautaId) });
    },
  });
}

/**
 * Registra um voto e atualiza a apuracao exibida.
 *
 * @returns a mutacao de registro de voto
 */
export function useVotar() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({
      pautaId,
      cpf,
      opcao,
    }: {
      pautaId: string;
      cpf: string;
      opcao: OpcaoVoto;
    }) => votar(pautaId, cpf, opcao),
    onSuccess: (_, variaveis) =>
      cliente.invalidateQueries({ queryKey: chaves.resultado(variaveis.pautaId) }),
  });
}
