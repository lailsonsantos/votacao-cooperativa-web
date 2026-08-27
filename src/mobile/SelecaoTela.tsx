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
 * Cada item funciona como um botao. O Anexo 1 descreve o comportamento como
 * "semelhante ao funcionamento dos botoes da tela FORMULARIO": ao acionar, envia
 * POST para a URL com o `body` do item.
 *
 * Itens **sem** `body` sao tratados como navegacao (GET). Essa distincao evita
 * que a lista de pautas, cujos itens so levam a outra tela, dispare um POST sem
 * sentido em cada toque.
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
