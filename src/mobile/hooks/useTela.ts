import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL, mensagemDeErro } from '../../api/cliente';
import { ehInput, type CorpoAcao, type ItemTela, type Tela } from '../types';

/** Valores digitados pelo usuário, indexados pelo `id` de cada campo. */
export type ValoresCampos = Record<string, string | number>;

/** Estado exposto pelo hook ao renderizador. */
export interface EstadoTela {
  tela: Tela | null;
  carregando: boolean;
  erro: string | null;
  valores: ValoresCampos;
  /** Historico de URLs visitadas, usado pelo botão "voltar" do simulador. */
  podeVoltar: boolean;
  definirValor: (id: string, valor: string | number) => void;
  navegar: (url: string) => void;
  executar: (url: string, corpo?: CorpoAcao) => void;
  voltar: () => void;
  reiniciar: () => void;
}

/**
 * Estado e navegação do cliente Server-Driven UI.
 *
 * @param urlInicial URL da primeira tela a carregar
 * @returns o estado da tela atual e as ações disponíveis
 */
export function useTela(urlInicial: string): EstadoTela {
  const [tela, setTela] = useState<Tela | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [valores, setValores] = useState<ValoresCampos>({});
  const [historico, setHistorico] = useState<string[]>([]);

  /**
   * Semeia o estado com os valores iniciais que vieram do servidor. Sem isso, um
   * campo já preenchido apareceria na tela mas não seria enviado.
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
   * @param nova tela devolvida pela requisição
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
    async (url: string, registrarHistorico = true, sinal?: AbortSignal) => {
      setCarregando(true);
      setErro(null);
      try {
        const { data } = await axios.get<Tela>(url, { timeout: 10_000, signal: sinal });
        if (registrarHistorico) {
          // A mesma URL duas vezes seguidas não empilha: o "voltar" levaria para
          // a tela em que o usuário já está.
          setHistorico((anterior) =>
            anterior[anterior.length - 1] === url ? anterior : [...anterior, url],
          );
        }
        aplicar(data);
      } catch (e) {
        // Requisição cancelada não é erro: quem cancelou já disparou outra.
        if (!axios.isCancel(e)) {
          setErro(mensagemDeErro(e));
        }
      } finally {
        if (!sinal?.aborted) {
          setCarregando(false);
        }
      }
    },
    [aplicar],
  );

  /**
   * Executa uma ação por POST e renderiza a tela devolvida.
   *
   * @param url URL absoluta da ação
   * @param corpo corpo fixo definido no botão ou no item de seleção
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

  /** Volta para a tela anterior do histórico. */
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
   * @param valor valor informado pelo usuário
   */
  const definirValor = useCallback((id: string, valor: string | number) => {
    setValores((anteriores) => ({ ...anteriores, [id]: valor }));
  }, []);

  useEffect(() => {
    // O StrictMode monta, desmonta e monta de novo em desenvolvimento. Sem
    // cancelar, a primeira carga chega depois da segunda e sobrescreve a tela.
    const controlador = new AbortController();
    void carregar(urlInicial, true, controlador.signal);
    return () => controlador.abort();
    // Só na montagem: a URL inicial não muda.
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
