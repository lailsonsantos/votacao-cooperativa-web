/** Tipos de tela que o cliente sabe renderizar. */
export type TipoTela = 'FORMULARIO' | 'SELECAO';

/** Tipos de item que podem compor uma tela FORMULARIO. */
export type TipoItem = 'TEXTO' | 'INPUT_TEXTO' | 'INPUT_NUMERO' | 'INPUT_DATA';

/** Texto somente leitura dentro de um FORMULARIO. */
export interface ItemTexto {
  tipo: 'TEXTO';
  texto: string;
}

/** Campo de entrada dentro de um FORMULARIO. */
export interface ItemInput {
  tipo: 'INPUT_TEXTO' | 'INPUT_NUMERO' | 'INPUT_DATA';
  /** Chave com que o valor digitado sera enviado no corpo do POST da ação. */
  id: string;
  /** Rotulo exibido acima do campo. */
  titulo?: string;
  /** Valor inicial. Número em INPUT_NÚMERO, texto nos demais. */
  valor?: string | number | null;
}

/**
 * Item de uma tela FORMULARIO.
 */
export type ItemTela = ItemTexto | ItemInput | { tipo: string; [chave: string]: unknown };

/** Corpo fixo que acompanha uma ação, definido pelo servidor. */
export type CorpoAcao = Record<string, unknown>;

/** Botão de ação no rodape de um FORMULARIO. */
export interface Botao {
  texto: string;
  url: string;
  body?: CorpoAcao;
}

/** Opção acionável de uma tela SELECAO. */
export interface ItemSelecao {
  texto: string;
  url: string;
  body?: CorpoAcao;
}

/** Tela FORMULARIO: coleção de itens com um ou dois botões no rodape. */
export interface TelaFormulario {
  tipo: 'FORMULARIO';
  titulo: string;
  itens: ItemTela[];
  botaoOk?: Botao;
  botaoCancelar?: Botao;
}

/** Tela SELECAO: lista de opções, cada uma com sua própria ação. */
export interface TelaSelecao {
  tipo: 'SELECAO';
  titulo: string;
  itens: ItemSelecao[];
}

/** Qualquer tela devolvida pelo servidor. */
export type Tela = TelaFormulario | TelaSelecao;

/**
 * Verifica se um item e um campo de entrada.
 *
 * @param item item vindo do servidor
 * @returns true quando o item aceita entrada do usuário
 */
export function ehInput(item: ItemTela): item is ItemInput {
  return (
    item.tipo === 'INPUT_TEXTO' ||
    item.tipo === 'INPUT_NUMERO' ||
    item.tipo === 'INPUT_DATA'
  );
}

/**
 * Verifica se um item e texto somente leitura.
 *
 * @param item item vindo do servidor
 * @returns true quando o item e apenas exibição
 */
export function ehTexto(item: ItemTela): item is ItemTexto {
  return item.tipo === 'TEXTO';
}
