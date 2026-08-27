import { FormularioTela } from './FormularioTela';
import { SelecaoTela } from './SelecaoTela';
import { useTela, URL_TELA_INICIAL } from './hooks/useTela';

/**
 * Renderizador generico das telas do Anexo 1.
 *
 * @param props.urlInicial URL da primeira tela; util para teste
 * @returns o simulador com a tela corrente
 */
export function TelaRenderer({ urlInicial = URL_TELA_INICIAL }: { urlInicial?: string }) {
  // Este componente não sabe o que e pauta, sessão ou voto. Le o JSON, escolhe
  // entre FORMULARIO e SELECAO, e devolve o que o usuário preencheu.
  const {
    tela,
    carregando,
    erro,
    valores,
    podeVoltar,
    definirValor,
    navegar,
    executar,
    voltar,
    reiniciar,
  } = useTela(urlInicial);

  return (
    <div className="simulador">
      <div className="simulador-barra">
        <button
          type="button"
          className="simulador-acao"
          onClick={voltar}
          disabled={!podeVoltar || carregando}
          aria-label="Voltar para a tela anterior"
        >
          ‹ Voltar
        </button>
        <span className="simulador-selo">Cliente Anexo 1</span>
        <button
          type="button"
          className="simulador-acao"
          onClick={reiniciar}
          disabled={carregando}
          aria-label="Reiniciar o simulador"
        >
          Reiniciar
        </button>
      </div>

      <div className="simulador-corpo">
        {erro && (
          <div className="alerta alerta-erro" role="alert">
            {erro}
          </div>
        )}

        {/* O indicador de carga só aparece na primeira carga. Nas transições a
            tela anterior permanece visível e os controles ficam desabilitados,
            o que evita o piscar branco a cada ação. */}
        {carregando && !tela && <p className="tela-texto">Carregando…</p>}

        {tela?.tipo === 'FORMULARIO' && (
          <FormularioTela
            tela={tela}
            valores={valores}
            desabilitado={carregando}
            aoAlterarCampo={definirValor}
            aoAcionar={executar}
            aoNavegar={navegar}
          />
        )}

        {tela?.tipo === 'SELECAO' && (
          <SelecaoTela
            tela={tela}
            desabilitado={carregando}
            aoAcionar={executar}
            aoNavegar={navegar}
          />
        )}

        {/* Blindagem contra um tipo de tela que este cliente não conhece. */}
        {tela && tela.tipo !== 'FORMULARIO' && tela.tipo !== 'SELECAO' && (
          <div className="alerta alerta-aviso" role="alert">
            Tipo de tela nao suportado nesta versao do aplicativo:{' '}
            <code>{String((tela as { tipo: string }).tipo)}</code>
          </div>
        )}
      </div>
    </div>
  );
}
