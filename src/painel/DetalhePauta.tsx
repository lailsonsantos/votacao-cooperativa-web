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
 * @param props identificador da pauta e callback de retorno
 * @returns o detalhe da pauta
 */
export function DetalhePauta({ pautaId, aoVoltar }: Props) {
  const [duracao, setDuracao] = useState('');
  const [cpf, setCpf] = useState('');

  const sessao = useSessao(pautaId);
  const resultado = useResultado(pautaId);
  const abrir = useAbrirSessao();
  const registrar = useVotar();

  const semSessao = !sessao.isLoading && sessao.data === null;
  const aberta = sessao.data?.status === 'ABERTA';

  /**
   * Envia o voto do CPF informado.
   *
   * @param opcao opcao escolhida
   */
  function enviarVoto(opcao: OpcaoVoto) {
    registrar.mutate(
      { pautaId, cpf, opcao },
      // Limpa o CPF pra proxima pessoa nao herdar o numero de quem votou antes.
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
            Nenhuma sessao foi aberta para esta pauta. Deixe a duracao em branco
            para usar o padrao definido pelo servidor.
          </p>

          <div className="campo">
            <label htmlFor="duracao">Duracao (minutos)</label>
            <input
              id="duracao"
              type="number"
              inputMode="numeric"
              placeholder="1"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
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
            disabled={abrir.isPending}
            onClick={() =>
              abrir.mutate({
                pautaId,
                duracao: duracao.trim() === '' ? undefined : Number(duracao),
              })
            }
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
              disabled={registrar.isPending || !cpf.trim()}
              onClick={() => enviarVoto('SIM')}
            >
              Sim
            </button>
            <button
              type="button"
              className="botao botao-nao"
              disabled={registrar.isPending || !cpf.trim()}
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
