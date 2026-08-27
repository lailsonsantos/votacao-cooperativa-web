import { CampoDesconhecido } from './campos/CampoDesconhecido';
import { CampoTexto } from './campos/CampoTexto';
import { InputData } from './campos/InputData';
import { InputNumero } from './campos/InputNumero';
import { InputTexto } from './campos/InputTexto';
import type { ValoresCampos } from './hooks/useTela';
import { ehInput, ehTexto, type CorpoAcao, type TelaFormulario } from './types';

/** Propriedades do renderizador de FORMULARIO. */
interface Props {
  tela: TelaFormulario;
  valores: ValoresCampos;
  desabilitado: boolean;
  aoAlterarCampo: (id: string, valor: string | number) => void;
  aoAcionar: (url: string, corpo?: CorpoAcao) => void;
  aoNavegar: (url: string) => void;
}

/**
 * Renderiza uma tela do tipo FORMULARIO do Anexo 1.
 *
 * A ordem dos itens e a do array recebido: a composicao da tela e decidida pelo
 * servidor, e o cliente nao reordena nem agrupa nada por conta propria.
 *
 * @param props tela, valores digitados e callbacks de interacao
 * @returns a tela renderizada
 */
export function FormularioTela({
  tela,
  valores,
  desabilitado,
  aoAlterarCampo,
  aoAcionar,
  aoNavegar,
}: Props) {
  return (
    <div className="tela">
      <h2 className="tela-titulo">{tela.titulo}</h2>

      <div className="tela-itens">
        {(tela.itens ?? []).map((item, indice) => {
          if (ehTexto(item)) {
            return <CampoTexto key={indice} item={item} />;
          }

          if (ehInput(item)) {
            const comuns = {
              item,
              valor: valores[item.id] ?? '',
              aoAlterar: (valor: string | number) => aoAlterarCampo(item.id, valor),
            };

            switch (item.tipo) {
              case 'INPUT_TEXTO':
                return <InputTexto key={item.id} {...comuns} />;
              case 'INPUT_NUMERO':
                return <InputNumero key={item.id} {...comuns} />;
              case 'INPUT_DATA':
                return <InputData key={item.id} {...comuns} />;
            }
          }

          // Tipo que este cliente nao conhece: avisa sem derrubar a tela.
          return <CampoDesconhecido key={indice} tipo={String(item.tipo)} />;
        })}
      </div>

      <div className="tela-rodape">
        {tela.botaoCancelar && (
          <button
            type="button"
            className="botao botao-secundario"
            disabled={desabilitado}
            // Cancelar e navegacao pura: nunca envia dados, mesmo que o servidor
            // informe um body. Confundir isso registraria voto ao cancelar.
            onClick={() => aoNavegar(tela.botaoCancelar!.url)}
          >
            {tela.botaoCancelar.texto}
          </button>
        )}

        {tela.botaoOk && (
          <button
            type="button"
            className="botao botao-primario"
            disabled={desabilitado}
            onClick={() =>
              // Mesma regra aplicada aos itens de SELECAO: a presenca de `body`
              // distingue acao de navegacao. Um botao sem `body` apenas leva a
              // outra tela ("Voltar", "Atualizar") e deve usar GET; tratar tudo
              // como POST tentaria enviar dados para um endpoint de leitura.
              tela.botaoOk!.body
                ? aoAcionar(tela.botaoOk!.url, tela.botaoOk!.body)
                : aoNavegar(tela.botaoOk!.url)
            }
          >
            {tela.botaoOk.texto}
          </button>
        )}
      </div>
    </div>
  );
}
