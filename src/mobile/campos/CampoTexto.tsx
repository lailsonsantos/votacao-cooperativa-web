import type { ItemTexto } from '../types';

/**
 * Renderiza um item do tipo TEXTO: conteudo somente leitura.
 *
 * @param props.item item de texto vindo do servidor
 * @returns o paragrafo correspondente
 */
export function CampoTexto({ item }: { item: ItemTexto }) {
  return <p className="tela-texto">{item.texto}</p>;
}
