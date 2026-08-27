import { FormularioTela } from './FormularioTela';
import { SelecaoTela } from './SelecaoTela';
import { useTela, URL_TELA_INICIAL } from './hooks/useTela';

/**
 * Renderizador generico das telas do Anexo 1.
 *
 * Este componente e o coracao do simulador de cliente. Ele **nao conhece o
 * dominio**: nao sabe o que e pauta, sessao ou voto. Recebe um JSON, decide
 * entre FORMULARIO e SELECAO pelo campo `tipo`, desenha o que veio, coleta os
 * valores pelos `id` dos campos e envia tudo de volta para a URL indicada.
 *
 * E justamente essa ignorancia que faz o componente servir como prova executavel
 * de que o backend cumpre o contrato do Anexo 1: nao ha nenhum conhecimento
 * embutido aqui para compensar uma resposta incorreta do servidor.
 *
 * @param props.urlInicial URL da primeira tela; util para teste
 * @returns o simulador com a tela corrente
 */
export function TelaRenderer({ urlInicial = URL_TELA_INICIAL }: { urlInicial?: string }) {
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

        {/* O indicador de carga so aparece na primeira carga. Nas transicoes a
            tela anterior permanece visivel e os controles ficam desabilitados,
            o que evita o piscar branco a cada acao. */}
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

        {/* Blindagem contra um tipo de tela que este cliente nao conhece. */}
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
