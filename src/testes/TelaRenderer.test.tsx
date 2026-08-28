import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelaRenderer } from '../mobile/TelaRenderer';

/**
 * Testes do renderizador generico das telas do Anexo 1.
 */

vi.mock('axios');
const axiosMock = vi.mocked(axios, true);

const URL = 'http://api.local/api/v1/telas';

/** Tela FORMULARIO do exemplo do Anexo 1, com os quatro tipos de item. */
const FORMULARIO_ANEXO1 = {
  tipo: 'FORMULARIO',
  titulo: 'TÍTULO TELA',
  itens: [
    { tipo: 'TEXTO', texto: 'Lorem ipsum dolor sit amet.' },
    { tipo: 'INPUT_TEXTO', id: 'idCampoTexto', titulo: 'Campo de texto', valor: 'Texto' },
    { tipo: 'INPUT_NUMERO', id: 'idCampoNumerico', titulo: 'Campo numérico', valor: 999 },
    { tipo: 'INPUT_DATA', id: 'idCampoData', titulo: 'Campo data', valor: '01/01/2000' },
  ],
  botaoOk: {
    texto: 'Ação 1',
    url: 'http://api.local/ACAO1',
    body: { campo1: 'valor1', campo2: 123 },
  },
  botaoCancelar: { texto: 'Cancelar', url: 'http://api.local/' },
};

/** Tela SELECAO do exemplo do Anexo 1. */
const SELECAO_ANEXO1 = {
  tipo: 'SELECAO',
  titulo: 'Lista de seleção',
  itens: [
    { texto: 'Opção 1', url: 'http://api.local/OPT1', body: { dadosOpcao: 'campo de teste' } },
    { texto: 'Opção 2', url: 'http://api.local/OPT2' },
  ],
};

describe('TelaRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os quatro tipos de item de um FORMULARIO', async () => {
    axiosMock.get.mockResolvedValue({ data: FORMULARIO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);

    expect(await screen.findByText('TÍTULO TELA')).toBeInTheDocument();
    expect(screen.getByText('Lorem ipsum dolor sit amet.')).toBeInTheDocument();
    expect(screen.getByLabelText('Campo de texto')).toHaveValue('Texto');
    expect(screen.getByLabelText('Campo numérico')).toHaveValue(999);
    // O input nativo de data trabalha em ISO; o Anexo 1 usa dd/MM/yyyy.
    expect(screen.getByLabelText('Campo data')).toHaveValue('2000-01-01');
    expect(screen.getByRole('button', { name: 'Ação 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('envia o body do botão mesclado com os valores digitados', async () => {
    axiosMock.get.mockResolvedValue({ data: FORMULARIO_ANEXO1 });
    axiosMock.post.mockResolvedValue({ data: SELECAO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('TÍTULO TELA');

    const campo = screen.getByLabelText('Campo de texto');
    await userEvent.clear(campo);
    await userEvent.type(campo, 'novo valor');

    await userEvent.click(screen.getByRole('button', { name: 'Ação 1' }));

    await waitFor(() => expect(axiosMock.post).toHaveBeenCalled());

    const [url, corpo] = axiosMock.post.mock.calls[0];
    expect(url).toBe('http://api.local/ACAO1');
    // Está e a regra central do Anexo 1: body do botão + valores digitados,
    // indexados pelo id de cada campo.
    expect(corpo).toEqual({
      campo1: 'valor1',
      campo2: 123,
      idCampoTexto: 'novo valor',
      idCampoNumerico: 999,
      idCampoData: '01/01/2000',
    });
  });

  it('mantém o valor inicial de um campo que o usuário não tocou', async () => {
    axiosMock.get.mockResolvedValue({ data: FORMULARIO_ANEXO1 });
    axiosMock.post.mockResolvedValue({ data: SELECAO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('TÍTULO TELA');

    await userEvent.click(screen.getByRole('button', { name: 'Ação 1' }));
    await waitFor(() => expect(axiosMock.post).toHaveBeenCalled());

    // Sem semear o estado com os valores iniciais, um campo pre-preenchido
    // apareceria na tela mas não seria enviado — bug silencioso.
    const [, corpo] = axiosMock.post.mock.calls[0];
    expect(corpo).toMatchObject({ idCampoTexto: 'Texto', idCampoNumerico: 999 });
  });

  it('renderiza uma tela SELECAO e envia o body do item acionado', async () => {
    axiosMock.get.mockResolvedValue({ data: SELECAO_ANEXO1 });
    axiosMock.post.mockResolvedValue({ data: FORMULARIO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('Lista de seleção');

    await userEvent.click(screen.getByRole('button', { name: /Opção 1/ }));

    await waitFor(() => expect(axiosMock.post).toHaveBeenCalled());
    const [url, corpo] = axiosMock.post.mock.calls[0];
    expect(url).toBe('http://api.local/OPT1');
    expect(corpo).toEqual({ dadosOpcao: 'campo de teste' });
  });

  it('trata item de SELECAO sem body como navegação, não como ação', async () => {
    axiosMock.get.mockResolvedValue({ data: SELECAO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('Lista de seleção');

    await userEvent.click(screen.getByRole('button', { name: /Opção 2/ }));

    // Um item sem body apenas leva a outra tela. Dispararia um POST vazio sem
    // sentido — e, no caso da lista de pautas, um POST por item tocado.
    await waitFor(() =>
      expect(axiosMock.get).toHaveBeenCalledWith('http://api.local/OPT2', expect.anything()),
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  it('não envia dados ao acionar o botão Cancelar', async () => {
    axiosMock.get.mockResolvedValue({ data: FORMULARIO_ANEXO1 });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('TÍTULO TELA');

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Cancelar e navegação pura. Se virasse POST, cancelar registraria voto.
    await waitFor(() =>
      expect(axiosMock.get).toHaveBeenCalledWith('http://api.local/', expect.anything()),
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  it('trata botaoOk sem body como navegação, não como ação', async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        tipo: 'FORMULARIO',
        titulo: 'Resultado',
        itens: [{ tipo: 'TEXTO', texto: 'Sim: 1 voto(s)' }],
        // Sem `body`: o servidor sinaliza navegação, e o destino e um GET.
        botaoOk: { texto: 'Atualizar', url: 'http://api.local/resultado' },
        botaoCancelar: { texto: 'Voltar', url: 'http://api.local/pautas' },
      },
    });

    render(<TelaRenderer urlInicial={URL} />);
    await screen.findByText('Resultado');

    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }));

    // Fazer POST aqui bateria em um endpoint de leitura e devolveria 405.
    await waitFor(() =>
      expect(axiosMock.get).toHaveBeenCalledWith(
        'http://api.local/resultado',
        expect.anything(),
      ),
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  it('não habilita o "voltar" na tela inicial quando o StrictMode monta duas vezes', async () => {
    axiosMock.get.mockResolvedValue({ data: SELECAO_ANEXO1 });

    render(
      <StrictMode>
        <TelaRenderer urlInicial={URL} />
      </StrictMode>,
    );
    await screen.findByText('Lista de seleção');

    // A montagem dupla empilhava a mesma URL duas vezes no histórico, e o
    // "voltar" ficava habilitado já na primeira tela, sem ter para onde voltar.
    expect(screen.getByRole('button', { name: 'Voltar para a tela anterior' })).toBeDisabled();
  });

  it('degrada graciosamente diante de um tipo de campo desconhecido', async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        tipo: 'FORMULARIO',
        titulo: 'Tela do futuro',
        itens: [
          { tipo: 'TEXTO', texto: 'Item conhecido' },
          { tipo: 'INPUT_ASSINATURA', id: 'assinatura', titulo: 'Assine aqui' },
        ],
        botaoOk: { texto: 'Ok', url: 'http://api.local/OK' },
      },
    });

    render(<TelaRenderer urlInicial={URL} />);

    // O item conhecido continua renderizando: um cliente Server-Driven UI
    // publicado em loja precisa sobreviver a um servidor mais novo que ele.
    expect(await screen.findByText('Item conhecido')).toBeInTheDocument();
    expect(screen.getByText(/não suportado nesta versão/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument();
  });

  it('exibe mensagem quando a API está indisponível', async () => {
    axiosMock.get.mockRejectedValue(new Error('falha de rede'));
    axiosMock.isAxiosError.mockReturnValue(false);

    render(<TelaRenderer urlInicial={URL} />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
