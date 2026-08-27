import { paraBrasileiro, paraIso } from './data';
import type { PropsCampo } from './InputTexto';

/**
 * Renderiza um item do tipo INPUT_DATA.
 *
 * @param props campos do item, valor atual e callback de alteracao
 * @returns o campo de entrada de data
 */
export function InputData({ item, valor, aoAlterar }: PropsCampo) {
  // O Anexo 1 usa dd/MM/yyyy e o input nativo so aceita ISO, entao converto nas
  // duas pontas.
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
