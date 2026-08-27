import type { Pauta } from '../api/tipos';

/** Propriedades da lista de pautas. */
interface Props {
  pautas: Pauta[];
  selecionada: string | null;
  aoSelecionar: (id: string) => void;
}

/**
 * Lista as pautas cadastradas, da mais recente para a mais antiga.
 *
 * @param props pautas, item selecionado e callback de seleção
 * @returns a lista de pautas
 */
export function ListaPautas({ pautas, selecionada, aoSelecionar }: Props) {
  if (pautas.length === 0) {
    return (
      <div className="cartao">
        <p className="texto-suave">
          Nenhuma pauta cadastrada. Crie a primeira no formulario acima.
        </p>
      </div>
    );
  }

  return (
    <div className="cartao">
      <h2 className="cartao-titulo">Pautas ({pautas.length})</h2>
      <ul className="lista">
        {pautas.map((pauta) => (
          <li key={pauta.id}>
            <button
              type="button"
              className={`lista-item ${selecionada === pauta.id ? 'lista-item--ativo' : ''}`}
              onClick={() => aoSelecionar(pauta.id)}
              // aria-current comunica a seleção a leitores de tela, que não
              // enxergam a diferenca puramente visual do item ativo.
              aria-current={selecionada === pauta.id ? 'true' : undefined}
            >
              <span className="lista-item-titulo">{pauta.titulo}</span>
              <span className="lista-item-data">{formatarData(pauta.criadaEm)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Formata um instante ISO no fuso do navegador.
 *
 * @param iso instante em formato ISO 8601
 * @returns data e hora legiveis em pt-BR
 */
function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
