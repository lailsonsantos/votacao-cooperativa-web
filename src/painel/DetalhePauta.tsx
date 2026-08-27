import { useState } from 'react';
import { mensagemDeErro } from '../api/cliente';
import type { OpcaoVoto } from '../api/tipos';
import { useAbrirSessao, useResultado, useSessao, useVotar } from './usePautas';
import { Contador } from './Contador';
import { PainelResultado } from './PainelResultado';

/** Propriedades do detalhe de pauta. */
interface Props {
  pautaId: string;
  aoVoltar: () => void;
}

/**
 * Detalhe de uma pauta: abertura de sessao, votacao e apuracao.
 *
 * O conteudo varia conforme o estado da sessao — inexistente, aberta ou
 * encerrada — pela mesma logica que a camada de telas aplica no servidor. Aqui,
 * porem, a decisao e do cliente, porque o painel consome a API REST e nao o
 * protocolo Server-Driven UI. E a diferenca entre as duas superficies, visivel
 * lado a lado.
 *
 * @param props identificador da pauta e callback de retorno
 * @returns o detalhe da pauta
 */
export function DetalhePauta({ pautaId, aoVoltar }: Props) {
  const [duracao, setDuracao] = useState(1);
  const [cpf, setCpf] = useState('');

  const sessao = useSessao(pautaId);
  const resultado = useResultado(pautaId);
  const abrir = useAbrirSessao();
  const registrar = useVotar();

  const semSessao = !sessao.isLoading && sessao.data === null;
  const aberta = sessao.data?.status === 'ABERTA';

  /**
   * Registra o voto do CPF informado.
   *
   * @param opcao opcao escolhida
   */
  function enviarVoto(opcao: OpcaoVoto) {
    const somenteDigitos = cpf.replace(/\D/g, '');
    if (somenteDigitos.length !== 11) return;

    registrar.mutate(
      { pautaId, cpf: somenteDigitos, opcao },
      // O CPF e limpo apos o voto para que a proxima pessoa use o mesmo
      // dispositivo sem herdar o numero de quem votou antes.
      { onSuccess: () => setCpf('') },
    );
  }

  return (
    <div className="detalhe">
      <button type="button" className="voltar-mobile" onClick={aoVoltar}>
        ‹ Pautas
      </button>

      {sessao.isLoading && <p className="texto-suave">Carregando sessao…</p>}

      {semSessao && (
        <div className="cartao">
          <h2 className="cartao-titulo">Abrir sessao de votacao</h2>
          <p className="texto-suave">
            Nenhuma sessao foi aberta para esta pauta.
          </p>

          <div className="campo">
            <label htmlFor="duracao">Duracao (minutos)</label>
            <input
              id="duracao"
              type="number"
              inputMode="numeric"
              min={1}
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
            />
          </div>

          {abrir.isError && (
            <div className="alerta alerta-erro" role="alert">
              {mensagemDeErro(abrir.error)}
            </div>
          )}

          <button
            type="button"
            className="botao botao-primario"
            disabled={abrir.isPending || duracao < 1}
            onClick={() => abrir.mutate({ pautaId, duracao })}
          >
            {abrir.isPending ? 'Abrindo…' : 'Abrir sessao'}
          </button>
        </div>
      )}

      {sessao.data && (
        <div className="cartao">
          <div className="cartao-cabecalho">
            <h2 className="cartao-titulo">Sessao</h2>
            <span className={`selo selo--${aberta ? 'aberta' : 'fechada'}`}>
              {sessao.data.status}
            </span>
          </div>
          <Contador segundos={sessao.data.segundosRestantes} aberta={aberta} />
        </div>
      )}

      {aberta && (
        <div className="cartao">
          <h2 className="cartao-titulo">Registrar voto</h2>

          <div className="campo">
            <label htmlFor="cpf">CPF do associado</label>
            <input
              id="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              maxLength={14}
            />
          </div>

          {registrar.isError && (
            <div className="alerta alerta-erro" role="alert">
              {mensagemDeErro(registrar.error)}
            </div>
          )}

          {registrar.isSuccess && (
            <div className="alerta alerta-sucesso" role="status">
              Voto registrado.
            </div>
          )}

          <div className="botoes-voto">
            <button
              type="button"
              className="botao botao-sim"
              disabled={registrar.isPending || cpf.replace(/\D/g, '').length !== 11}
              onClick={() => enviarVoto('SIM')}
            >
              Sim
            </button>
            <button
              type="button"
              className="botao botao-nao"
              disabled={registrar.isPending || cpf.replace(/\D/g, '').length !== 11}
              onClick={() => enviarVoto('NAO')}
            >
              Nao
            </button>
          </div>
        </div>
      )}

      {resultado.data && <PainelResultado resultado={resultado.data} />}
    </div>
  );
}
