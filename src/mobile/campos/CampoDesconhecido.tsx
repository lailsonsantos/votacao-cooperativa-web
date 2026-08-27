/**
 * Renderiza um item cujo tipo o cliente nao conhece.
 *
 * Um cliente Server-Driven UI **precisa** sobreviver a um servidor mais novo do
 * que ele. Aplicativos publicados em loja continuam em campo por meses; se o
 * backend passar a emitir um tipo de campo novo, a tela inteira nao pode deixar
 * de renderizar por causa de um item desconhecido.
 *
 * Este componente e a contrapartida, no cliente, da regra de versionamento
 * documentada no backend: mudanca compativel nao sobe a versao porque o cliente
 * ignora graciosamente o que nao conhece.
 *
 * @param props.tipo tipo recebido do servidor
 * @returns um aviso discreto, sem quebrar a tela
 */
export function CampoDesconhecido({ tipo }: { tipo: string }) {
  return (
    <p className="tela-desconhecido" role="note">
      Campo nao suportado nesta versao do aplicativo: <code>{tipo}</code>
    </p>
  );
}
