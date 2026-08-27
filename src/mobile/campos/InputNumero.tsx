import type { PropsCampo } from './InputTexto';

/**
 * Renderiza um item do tipo INPUT_NUMERO.
 *
 * O valor e convertido para `number` antes de ir ao estado, para que o JSON
 * enviado ao servidor carregue um numero e nao uma string — o Anexo 1 mostra
 * `"idCampoNumerico": 999`, sem aspas. Campo vazio vira string vazia, e nao
 * `NaN`, que serializaria como `null` e confundiria o backend.
 *
 * `inputMode="numeric"` faz o teclado numerico abrir no celular, sem impedir a
 * digitacao no desktop.
 *
 * @param props campos do item, valor atual e callback de alteracao
 * @returns o campo de entrada numerica
 */
export function InputNumero({ item, valor, aoAlterar }: PropsCampo) {
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
