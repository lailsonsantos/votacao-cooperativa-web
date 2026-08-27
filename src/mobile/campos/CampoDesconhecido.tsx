export function CampoDesconhecido({ tipo }: { tipo: string }) {
  // O app precisa aguentar um servidor mais novo que ele: campo desconhecido
  // vira aviso em vez de quebrar a tela inteira.
  return (
    <p className="tela-desconhecido" role="note">
      Campo nao suportado nesta versao do aplicativo: <code>{tipo}</code>
    </p>
  );
}
