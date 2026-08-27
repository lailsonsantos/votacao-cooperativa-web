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
 * @param props tela, valores digitados e callbacks de interação
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

          // Tipo que este cliente não conhece: avisa sem derrubar a tela.
          return <CampoDesconhecido key={indice} tipo={String(item.tipo)} />;
        })}
      </div>

      <div className="tela-rodape">
        {tela.botaoCancelar && (
          <button
            type="button"
            className="botao botao-secundario"
            disabled={desabilitado}
            // Cancelar só navega. Se enviasse dados, cancelar registraria voto.
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
              // Igual ao SELECAO: com `body` é ação (POST), sem `body` é navegação
              // (GET). "Voltar" e "Atualizar" caem no segundo caso.
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
