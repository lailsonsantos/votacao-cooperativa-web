/**
 * Exibe o tempo restante da sessao de votacao.
 *
 * O valor vem do servidor a cada revalidacao, e nao de um `setInterval` local:
 * um contador puramente local divergiria do relogio do servidor conforme a aba
 * ficasse em segundo plano, e passaria a mentir sobre o prazo real.
 *
 * @param props.segundos segundos restantes informados pela API
 * @param props.aberta se a sessao ainda aceita votos
 * @returns o contador formatado
 */
export function Contador({ segundos, aberta }: { segundos: number; aberta: boolean }) {
  if (!aberta) {
    return <p className="contador contador--encerrado">Votacao encerrada</p>;
  }

  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;

  return (
    <p className="contador" aria-live="polite">
      <span className="contador-numero">
        {String(minutos).padStart(2, '0')}:{String(resto).padStart(2, '0')}
      </span>
      <span className="contador-rotulo">restantes para votar</span>
    </p>
  );
}
