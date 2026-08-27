import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mensagemDeErro } from '../../api/cliente';
import { ehInput, type CorpoAcao, type ItemTela, type Tela } from '../types';

/** Valores digitados pelo usuario, indexados pelo `id` de cada campo. */
export type ValoresCampos = Record<string, string | number>;

/** Estado exposto pelo hook ao renderizador. */
export interface EstadoTela {
  tela: Tela | null;
  carregando: boolean;
  erro: string | null;
  valores: ValoresCampos;
  /** Historico de URLs visitadas, usado pelo botao "voltar" do simulador. */
  podeVoltar: boolean;
  definirValor: (id: string, valor: string | number) => void;
  navegar: (url: string) => void;
  executar: (url: string, corpo?: CorpoAcao) => void;
  voltar: () => void;
  reiniciar: () => void;
}

/**
 * Estado e navegacao do cliente Server-Driven UI.
 *
 * Este hook implementa o protocolo do Anexo 1 e nada alem dele. Ele nao sabe o
 * que e pauta, sessao ou voto: recebe uma tela, guarda os valores digitados
 * indexados pelo `id` de cada campo e, ao acionar uma acao, envia
 * `{ ...body, ...valoresDigitados }` para a URL indicada e renderiza a tela que
 * voltar.
 *
 * E essa ignorancia deliberada sobre o dominio que faz o simulador servir como
 * prova de que o backend cumpre o contrato: se ele funciona, o contrato esta
 * correto, porque nao ha nenhum conhecimento embutido para compensar uma falha.
 *
 * @param urlInicial URL da primeira tela a carregar
 * @returns o estado da tela atual e as acoes disponiveis
 */
export function useTela(urlInicial: string): EstadoTela {
  const [tela, setTela] = useState<Tela | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [valores, setValores] = useState<ValoresCampos>({});
  const [historico, setHistorico] = useState<string[]>([]);

  /**
   * Preenche o estado dos campos com os valores iniciais vindos do servidor.
   *
   * O Anexo 1 permite que um `INPUT_*` traga `valor`. Sem esta semeadura, um
   * campo pre-preenchido apareceria na tela mas nao seria enviado caso o usuario
   * nao o tocasse — um bug silencioso e dificil de rastrear.
   *
   * @param itens itens da tela recem-carregada
   * @returns o mapa de valores iniciais
   */
  const valoresIniciais = useCallback((itens: ItemTela[] = []): ValoresCampos => {
    const iniciais: ValoresCampos = {};
    for (const item of itens) {
      if (ehInput(item) && item.valor !== null && item.valor !== undefined) {
        iniciais[item.id] = item.valor;
      }
    }
    return iniciais;
  }, []);

  /**
   * Aplica uma tela recebida do servidor ao estado local.
   *
   * @param nova tela devolvida pela requisicao
   */
  const aplicar = useCallback(
    (nova: Tela) => {
      setTela(nova);
      setValores(nova.tipo === 'FORMULARIO' ? valoresIniciais(nova.itens) : {});
    },
    [valoresIniciais],
  );

  /**
   * Carrega uma tela por GET.
   *
   * @param url URL absoluta da tela
   * @param registrarHistorico se a tela atual deve entrar na pilha de retorno
   */
  const carregar = useCallback(
    async (url: string, registrarHistorico = true) => {
      setCarregando(true);
      setErro(null);
      try {
        const { data } = await axios.get<Tela>(url, { timeout: 10_000 });
        if (registrarHistorico) {
          setHistorico((anterior) => [...anterior, url]);
        }
        aplicar(data);
      } catch (e) {
        setErro(mensagemDeErro(e));
      } finally {
        setCarregando(false);
      }
    },
    [aplicar],
  );

  /**
   * Executa uma acao por POST e renderiza a tela devolvida.
   *
   * O corpo enviado e o `body` definido pelo servidor mesclado com os valores
   * digitados — exatamente a regra descrita no Anexo 1. A ordem importa: os
   * valores do usuario vem depois, porque um campo editavel deve sobrescrever o
   * valor sugerido pelo servidor.
   *
   * @param url URL absoluta da acao
   * @param corpo corpo fixo definido no botao ou no item de selecao
   */
  const executar = useCallback(
    async (url: string, corpo: CorpoAcao = {}) => {
      setCarregando(true);
      setErro(null);
      try {
        const payload = { ...corpo, ...valores };
        const { data } = await axios.post<Tela>(url, payload, { timeout: 10_000 });
        setHistorico((anterior) => [...anterior, url]);
        aplicar(data);
      } catch (e) {
        setErro(mensagemDeErro(e));
      } finally {
        setCarregando(false);
      }
    },
    [valores, aplicar],
  );

  /**
   * Navega para outra tela por GET.
   *
   * @param url URL absoluta de destino
   */
  const navegar = useCallback(
    (url: string) => {
      void carregar(url);
    },
    [carregar],
  );

  /** Volta para a tela anterior do historico. */
  const voltar = useCallback(() => {
    setHistorico((anterior) => {
      if (anterior.length < 2) return anterior;
      const destino = anterior[anterior.length - 2];
      void carregar(destino, false);
      return anterior.slice(0, -1);
    });
  }, [carregar]);

  /** Reinicia o simulador na tela inicial. */
  const reiniciar = useCallback(() => {
    setHistorico([]);
    void carregar(urlInicial);
  }, [carregar, urlInicial]);

  /**
   * Registra o valor digitado em um campo.
   *
   * @param id chave do campo, definida pelo servidor
   * @param valor valor informado pelo usuario
   */
  const definirValor = useCallback((id: string, valor: string | number) => {
    setValores((anteriores) => ({ ...anteriores, [id]: valor }));
  }, []);

  useEffect(() => {
    void carregar(urlInicial);
    // Executa apenas na montagem: a URL inicial nao muda durante a sessao.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tela,
    carregando,
    erro,
    valores,
    podeVoltar: historico.length > 1,
    definirValor,
    navegar,
    executar,
    voltar,
    reiniciar,
  };
}

/** URL da tela inicial do simulador, montada a partir da API configurada. */
export const URL_TELA_INICIAL = `${BASE_URL}/api/v1/telas`;
