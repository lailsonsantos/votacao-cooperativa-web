import { useState, type FormEvent } from 'react';
import { useCriarPauta } from './usePautas';
import { mensagemDeErro } from '../api/cliente';
import type { Pauta } from '../api/tipos';

/**
 * Formulário de cadastro de pauta.
 *
 * @param props.aoCriar callback disparado com a pauta recem-criada
 * @returns o formulário de cadastro
 */
export function NovaPautaForm({ aoCriar }: { aoCriar: (pauta: Pauta) => void }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const criar = useCriarPauta();

  /**
   * Envia o formulário e limpa os campos em caso de sucesso.
   *
   * @param evento evento de submissao do formulário
   */
  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!titulo.trim()) return;

    criar.mutate(
      { titulo: titulo.trim(), descricao: descricao.trim() },
      {
        onSuccess: (pauta) => {
          // Limpar só no sucesso preserva o que foi digitado quando a chamada
          // falha, evitando que o usuário perca o texto por um erro de rede.
          setTitulo('');
          setDescricao('');
          aoCriar(pauta);
        },
      },
    );
  }

  return (
    <form className="cartao" onSubmit={enviar}>
      <h2 className="cartao-titulo">Nova pauta</h2>

      <div className="campo">
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Reforma do estatuto social"
          maxLength={200}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Atualização dos artigos 12 a 18."
          rows={2}
          maxLength={2000}
        />
      </div>

      {criar.isError && (
        <div className="alerta alerta-erro" role="alert">
          {mensagemDeErro(criar.error)}
        </div>
      )}

      <button
        type="submit"
        className="botao botao-primario"
        disabled={criar.isPending || !titulo.trim()}
      >
        {criar.isPending ? 'Cadastrando…' : 'Cadastrar pauta'}
      </button>
    </form>
  );
}
