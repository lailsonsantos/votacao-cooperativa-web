export function Contador({ segundos, aberta }: { segundos: number; aberta: boolean }) {
  // Os segundos vem do servidor a cada revalidacao. Um setInterval local
  // divergiria do relogio dele com a aba em segundo plano.
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
