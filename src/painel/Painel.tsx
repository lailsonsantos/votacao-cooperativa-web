import { useState } from 'react';
import { NovaPautaForm } from './NovaPautaForm';
import { ListaPautas } from './ListaPautas';
import { DetalhePauta } from './DetalhePauta';
import { usePautas } from './usePautas';
import { mensagemDeErro } from '../api/cliente';

/**
 * Painel administrativo: consome a API REST v1 diretamente.
 *
 * @returns o painel administrativo
 */
export function Painel() {
  const [pautaSelecionada, setPautaSelecionada] = useState<string | null>(null);
  const { data, isLoading, error } = usePautas();

  return (
    <div className="painel">
      <section
        className={`painel-coluna ${pautaSelecionada ? 'painel-coluna--oculta-mobile' : ''}`}
        aria-label="Pautas"
      >
        <NovaPautaForm aoCriar={(pauta) => setPautaSelecionada(pauta.id)} />

        {isLoading && <p className="texto-suave">Carregando pautas…</p>}

        {error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemDeErro(error)}
          </div>
        )}

        {data && (
          <ListaPautas
            pautas={data.conteudo}
            selecionada={pautaSelecionada}
            aoSelecionar={setPautaSelecionada}
          />
        )}
      </section>

      <section
        className={`painel-coluna painel-coluna--detalhe ${
          pautaSelecionada ? '' : 'painel-coluna--oculta-mobile'
        }`}
        aria-label="Detalhe da pauta"
      >
        {pautaSelecionada ? (
          <DetalhePauta
            pautaId={pautaSelecionada}
            aoVoltar={() => setPautaSelecionada(null)}
          />
        ) : (
          <div className="vazio">
            <p>Selecione uma pauta para abrir a sessao, votar e acompanhar a apuracao.</p>
          </div>
        )}
      </section>
    </div>
  );
}
