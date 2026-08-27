import type { ItemInput } from '../types';

/**
 * Propriedades comuns a todos os campos de entrada.
 */
export interface PropsCampo {
  /** Item vindo do servidor, com id, titulo e valor inicial. */
  item: ItemInput;
  /** Valor atual do campo no estado do renderizador. */
  valor: string | number;
  /** Notifica o renderizador de uma alteracao. */
  aoAlterar: (valor: string | number) => void;
}

/**
 * Renderiza um item do tipo INPUT_TEXTO.
 *
 * @param props campos do item, valor atual e callback de alteracao
 * @returns o campo de entrada de texto
 */
export function InputTexto({ item, valor, aoAlterar }: PropsCampo) {
  return (
    <div className="tela-campo">
      <label className="tela-rotulo" htmlFor={item.id}>
        {item.titulo ?? item.id}
      </label>
      <input
        id={item.id}
        name={item.id}
        type="text"
        className="tela-input"
        value={String(valor ?? '')}
        onChange={(e) => aoAlterar(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
