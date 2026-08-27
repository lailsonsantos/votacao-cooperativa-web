import type { PropsCampo } from './InputTexto';

/**
 * Renderiza um item do tipo INPUT_NUMERO.
 *
 * @param props campos do item, valor atual e callback de alteracao
 * @returns o campo de entrada numerica
 */
export function InputNumero({ item, valor, aoAlterar }: PropsCampo) {
  // Converte pra number antes de guardar: o Anexo 1 mostra 999 sem aspas.
  // Campo vazio vira string vazia, e nao NaN.
  return (
    <div className="tela-campo">
      <label className="tela-rotulo" htmlFor={item.id}>
        {item.titulo ?? item.id}
      </label>
      <input
        id={item.id}
        name={item.id}
        type="number"
        inputMode="numeric"
        className="tela-input"
        value={valor === '' || valor === undefined ? '' : String(valor)}
        onChange={(e) => {
          const bruto = e.target.value;
          aoAlterar(bruto === '' ? '' : Number(bruto));
        }}
      />
    </div>
  );
}
