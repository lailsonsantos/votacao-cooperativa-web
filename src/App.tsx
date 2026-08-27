import { useState } from 'react';
import { Painel } from './painel/Painel';
import { TelaRenderer } from './mobile/TelaRenderer';
import { BASE_URL } from './api/cliente';

/** Abas disponiveis na aplicacao. */
type Aba = 'painel' | 'simulador';

/**
 * Casca da aplicacao, com as duas visoes lado a lado.
 *
 * @returns a aplicacao completa
 */
export function App() {
  const [aba, setAba] = useState<Aba>('painel');

  return (
    <div className="app">
      <header className="cabecalho">
        <div className="cabecalho-marca">
          <span className="cabecalho-simbolo" aria-hidden="true">◆</span>
          <div>
            <h1>Assembleia Cooperativa</h1>
            <p className="cabecalho-api">{BASE_URL}</p>
          </div>
        </div>

        <nav className="abas" aria-label="Modo de visualizacao">
          <button
            type="button"
            className={`aba ${aba === 'painel' ? 'aba--ativa' : ''}`}
            onClick={() => setAba('painel')}
            aria-pressed={aba === 'painel'}
          >
            Painel
            <span className="aba-detalhe">API REST</span>
          </button>
          <button
            type="button"
            className={`aba ${aba === 'simulador' ? 'aba--ativa' : ''}`}
            onClick={() => setAba('simulador')}
            aria-pressed={aba === 'simulador'}
          >
            Simulador
            <span className="aba-detalhe">Telas do Anexo 1</span>
          </button>
        </nav>
      </header>

      <main className="conteudo">
        {aba === 'painel' ? (
          <Painel />
        ) : (
          <div className="simulador-area">
            <div className="simulador-explicacao">
              <h2>Cliente do Anexo 1</h2>
              <p>
                O renderizador ao lado nao conhece pauta, sessao nem voto. Ele le o JSON
                devolvido por <code>/api/v1/telas</code>, decide entre{' '}
                <code>FORMULARIO</code> e <code>SELECAO</code>, coleta os valores pelos{' '}
                <code>id</code> dos campos e envia tudo de volta para a URL do botao.
              </p>
              <p>
                A navegacao inteira e dirigida pelo servidor: cada acao devolve a proxima
                tela. Se o fluxo funciona aqui, o contrato do Anexo 1 esta correto — nao
                ha nenhum conhecimento de dominio embutido no cliente para compensar.
              </p>
            </div>

            <div className="moldura">
              <div className="moldura-entalhe" aria-hidden="true" />
              <TelaRenderer />
            </div>
          </div>
        )}
      </main>

      <footer className="rodape">
        <span>Teste tecnico · Votacao em assembleias cooperativas</span>
        <a
          href="https://github.com/lailsonsantos/votacao-cooperativa-api"
          target="_blank"
          rel="noreferrer"
        >
          Repositorio da API
        </a>
      </footer>
    </div>
  );
}
