import type { Resultado } from '../api/tipos';

/** Texto apresentado para cada desfecho possível. */
const DESCRICAO: Record<Resultado['resultado'], string> = {
  APROVADA: 'Aprovada',
  REPROVADA: 'Reprovada',
  EMPATE: 'Empate',
  SEM_VOTOS: 'Nenhum voto registrado',
};

/**
 * Exibe a apuração de uma pauta com barra proporcional de votos.
 *
 * @param props.resultado apuração devolvida pela API
 * @returns o painel de resultado
 */
export function PainelResultado({ resultado }: { resultado: Resultado }) {
  const total = resultado.totalVotos;
  const percentualSim = total > 0 ? (resultado.votosSim / total) * 100 : 0;
  const percentualNao = total > 0 ? (resultado.votosNao / total) * 100 : 0;

  return (
    <div className="cartao">
      <div className="cartao-cabecalho">
        <h2 className="cartao-titulo">Apuração</h2>
        {resultado.parcial && <span className="selo selo--parcial">Parcial</span>}
      </div>

      <p className={`desfecho desfecho--${resultado.resultado.toLowerCase()}`}>
        {DESCRICAO[resultado.resultado]}
      </p>

      <div className="barra" role="img" aria-label={`${resultado.votosSim} sim, ${resultado.votosNao} nao`}>
        <div className="barra-sim" style={{ width: `${percentualSim}%` }} />
        <div className="barra-nao" style={{ width: `${percentualNao}%` }} />
      </div>

      <dl className="numeros">
        <div>
          <dt>Sim</dt>
          <dd className="numero numero--sim">{resultado.votosSim}</dd>
        </div>
        <div>
          <dt>Não</dt>
          <dd className="numero numero--nao">{resultado.votosNao}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd className="numero">{total}</dd>
        </div>
      </dl>
    </div>
  );
}
