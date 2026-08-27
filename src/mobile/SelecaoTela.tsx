import type { CorpoAcao, TelaSelecao } from './types';

/** Propriedades do renderizador de SELECAO. */
interface Props {
  tela: TelaSelecao;
  desabilitado: boolean;
  aoAcionar: (url: string, corpo?: CorpoAcao) => void;
  aoNavegar: (url: string) => void;
}

/**
 * Renderiza uma tela do tipo SELECAO do Anexo 1.
 *
 * @param props tela e callbacks de interacao
 * @returns a lista de opcoes renderizada
 */
export function SelecaoTela({ tela, desabilitado, aoAcionar, aoNavegar }: Props) {
  return (
    <div className="tela">
      <h2 className="tela-titulo">{tela.titulo}</h2>

      <ul className="tela-lista">
        {(tela.itens ?? []).map((item, indice) => (
          <li key={`${item.url}-${indice}`}>
            {/* Com body e acao (POST); sem body e so navegacao (GET). Senao a
                lista de pautas dispararia um POST por item tocado. */}
            <button
              type="button"
              className="tela-opcao"
              disabled={desabilitado}
              onClick={() =>
                item.body ? aoAcionar(item.url, item.body) : aoNavegar(item.url)
              }
            >
              <span>{item.texto}</span>
              <span className="tela-opcao-seta" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>

      {(tela.itens ?? []).length === 0 && (
        <p className="tela-texto">Nenhuma opcao disponivel.</p>
      )}
    </div>
  );
}
