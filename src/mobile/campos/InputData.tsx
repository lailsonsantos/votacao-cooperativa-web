import { paraBrasileiro, paraIso } from './data';
import type { PropsCampo } from './InputTexto';

/**
 * Renderiza um item do tipo INPUT_DATA.
 *
 * A conversao de formato acontece nas duas pontas — ao exibir e ao devolver o
 * valor — porque o Anexo 1 usa `dd/MM/yyyy` e o input nativo exige ISO. Sem
 * isso, o campo pareceria funcionar na tela e enviaria um formato que o servidor
 * nao espera.
 *
 * @param props campos do item, valor atual e callback de alteracao
 * @returns o campo de entrada de data
 */
export function InputData({ item, valor, aoAlterar }: PropsCampo) {
  return (
    <div className="tela-campo">
      <label className="tela-rotulo" htmlFor={item.id}>
        {item.titulo ?? item.id}
      </label>
      <input
        id={item.id}
        name={item.id}
        type="date"
        className="tela-input"
        value={paraIso(String(valor ?? ''))}
        onChange={(e) => aoAlterar(paraBrasileiro(e.target.value))}
      />
    </div>
  );
}
