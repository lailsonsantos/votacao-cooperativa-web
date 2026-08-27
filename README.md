# Votação Cooperativa — Web

Cliente web responsivo de um sistema de **votação em assembleias de
cooperativas**. Funciona em desktop e celular a partir de uma única base de
código.

No cooperativismo, cada associado tem direito a **um voto**, e as decisões são
tomadas em assembleia. O sistema digitaliza esse processo: cadastra-se uma
**pauta** (o assunto em deliberação), abre-se uma **sessão de votação** com prazo
determinado, os associados votam **Sim** ou **Não** — cada um uma única vez — e
ao final o resultado é apurado.

**Backend (repositório separado):** https://github.com/lailsonsantos/votacao-cooperativa-api

---

## No ar

### **https://votacao-cooperativa-web.onrender.com**

A aplicação tem duas abas, que consomem as **duas superfícies HTTP** do backend:

| Aba | Consome | O que demonstra |
|---|---|---|
| **Painel** | `/api/v1/**` (REST) | Cadastro, abertura de sessão, voto e apuração ao vivo |
| **Simulador** | `/api/v1/telas/**` (Server-Driven UI) | O contrato do Anexo 1 funcionando ponta a ponta |

**Documentação da API:** https://votacao-cooperativa-api.onrender.com/swagger-ui.html

### Sobre a hospedagem

O frontend é um **site estático** no Render: não hiberna, não tem cold start e
carrega instantaneamente.

A **API**, porém, é um serviço com o comportamento abaixo:

| | `starter` (em uso) | `free` |
|---|---|---|
| Hiberna | Não | Após **15 min** sem requisições |
| Tempo para acordar | — | **~50 s** na primeira requisição |

Se a API estiver no plano `free` e a primeira ação da tela demorar, ela não está
quebrada — está acordando. A tela apenas fica em "Carregando…" até a resposta
chegar.

> O banco de dados usa o plano gratuito do Render, que **expira 30 dias após a
> criação**. Depois disso a aplicação continua no ar, mas sem dados.

---

## Instalação e execução

**Pré-requisitos:** Node 20+ e a API rodando (local ou em produção).

```bash
git clone https://github.com/lailsonsantos/votacao-cooperativa-web.git
cd votacao-cooperativa-web

npm install
cp .env.example .env.local
```

Edite o `.env.local` apontando para a API:

```bash
# API local
VITE_API_BASE_URL=http://localhost:8080

# ou a API publicada — permite rodar o front local sem subir o backend
VITE_API_BASE_URL=https://votacao-cooperativa-api.onrender.com
```

```bash
npm run dev     # http://localhost:5173
```

A URL **não** inclui o sufixo `/api/v1` — o cliente o acrescenta.

### Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Typecheck + bundle de produção em `dist/` |
| `npm run preview` | Serve o bundle já compilado |
| `npm test` | Suíte de testes (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir arquivos |

### Se o front local não conversar com a API

Duas causas cobrem quase todos os casos:

1. **CORS.** A API só aceita origens declaradas. Suba o backend com
   `APP_CORS_ALLOWED_ORIGINS=http://localhost:5173`.
2. **A variável não foi aplicada.** O Vite injeta `VITE_API_BASE_URL` em tempo de
   **build**; ao alterar o `.env.local`, reinicie o `npm run dev`.

O endereço da API em uso aparece no cabeçalho da aplicação — é o jeito mais
rápido de confirmar para onde ela está apontando.

### Abrir de um celular na mesma rede

O Vite já escuta em `0.0.0.0`. Aponte o `.env.local` para o IP da máquina e
libere a origem no backend:

```bash
# .env.local
VITE_API_BASE_URL=http://192.168.0.10:8080
```

```bash
# no backend
APP_CORS_ALLOWED_ORIGINS=http://192.168.0.10:5173 \
APP_CALLBACK_BASE_URL=http://192.168.0.10:8080 \
docker compose up
```

`APP_CALLBACK_BASE_URL` importa porque as URLs das telas são **absolutas**: com
`localhost` o celular tentaria falar consigo mesmo.

### Docker

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t votacao-web .
docker run -p 5173:80 votacao-web
```

A URL da API é argumento de **build**, não de execução — trocá-la exige
reconstruir a imagem, que é o comportamento esperado de um bundle estático.

---

## O simulador é a peça central

O enunciado do teste diz textualmente: *"A aplicação cliente não faz parte da
avaliação, apenas os componentes do servidor."* Este repositório é, portanto, um
**diferencial** — mas não decorativo. Ele prova, de forma executável, que o
backend cumpre o contrato de telas do Anexo 1.

O renderizador em `src/mobile/` **não conhece o domínio**. Não sabe o que é
pauta, sessão ou voto. Ele:

1. recebe um JSON de tela;
2. decide entre `FORMULARIO` e `SELECAO` pelo campo `tipo`;
3. desenha os itens conforme o tipo de cada um;
4. coleta os valores digitados indexados pelo `id` de cada campo;
5. ao acionar um botão, envia `POST` para a `url` com `{ ...body, ...valores }`;
6. renderiza a tela que voltar.

É essa ignorância deliberada que faz o simulador servir como prova: se o fluxo
completo funciona — cadastrar pauta, abrir sessão, informar CPF, votar, ver o
resultado — então o contrato está correto, porque não há nenhum conhecimento de
domínio embutido no cliente para compensar uma resposta errada do servidor.

```
src/mobile/
├── TelaRenderer.tsx        Escolhe FORMULARIO x SELECAO pelo campo "tipo"
├── FormularioTela.tsx      Renderiza itens + botaoOk/botaoCancelar
├── SelecaoTela.tsx         Renderiza a lista de opções acionáveis
├── campos/
│   ├── CampoTexto.tsx          tipo TEXTO
│   ├── InputTexto.tsx          tipo INPUT_TEXTO
│   ├── InputNumero.tsx         tipo INPUT_NUMERO
│   ├── InputData.tsx           tipo INPUT_DATA
│   ├── data.ts                 conversão dd/MM/yyyy ↔ ISO
│   └── CampoDesconhecido.tsx   tipo que este cliente não conhece
├── hooks/useTela.ts        Navegação dirigida pelo servidor + estado dos campos
└── types.ts                Tipos espelhando o contrato do Anexo 1
```

### Três detalhes do protocolo que não são óbvios

**1. Datas usam `dd/MM/yyyy`, não ISO.** O exemplo do PDF traz `"01/01/2000"`. O
`<input type="date">` do navegador só trabalha com `yyyy-MM-dd`, então a
conversão acontece nas duas pontas (`campos/data.ts`). Sem isso o campo pareceria
funcionar e enviaria um formato que o servidor não espera.

**2. A presença de `body` distingue ação de navegação.** Um botão ou item **com**
`body` dispara `POST`; **sem** `body` é apenas navegação (`GET`). Tratar tudo
como `POST` faria "Cancelar" registrar voto e "Atualizar" bater `405` num
endpoint de leitura.

**3. Valores iniciais precisam ser semeados no estado.** O Anexo 1 permite que um
`INPUT_*` traga `valor`. Sem semear, um campo pré-preenchido apareceria na tela
mas não seria enviado caso o usuário não o tocasse — bug silencioso.

### Degradação graciosa

Um cliente Server-Driven UI **precisa** sobreviver a um servidor mais novo que
ele: aplicativos publicados em loja continuam em campo por meses. Um tipo de
campo desconhecido vira um aviso discreto e o resto da tela continua renderizando
(`CampoDesconhecido.tsx`).

Isso é a contrapartida, no cliente, da política de versionamento documentada no
backend: *mudança compatível não sobe a versão porque o cliente ignora
graciosamente o que não conhece.*

---

## Responsividade

Uma única árvore de componentes serve desktop e celular; o que muda é o CSS.
**Não existem componentes duplicados por tamanho de tela.**

| Largura | Painel | Simulador |
|---|---|---|
| ≥ 900px | Duas colunas: lista à esquerda, detalhe à direita | Explicação e moldura lado a lado |
| < 900px | Coluna única; a pauta selecionada ocupa a tela inteira, com botão "‹ Pautas" | Empilhados |

Cuidados específicos de toque, verificados no navegador:

- Campos com `font-size: 16px` — abaixo disso o Safari no iOS dá zoom ao focar.
- Alvos de toque com `min-height: 44px`.
- `env(safe-area-inset-*)` no cabeçalho e no rodapé, para aparelhos com notch.
- `inputMode="numeric"` nos campos numéricos, para abrir o teclado certo.
- Sem rolagem horizontal em nenhuma largura.
- Tema claro e escuro pelo `prefers-color-scheme`.
- `prefers-reduced-motion` respeitado.

---

## Testes

```bash
npm test
```

**14 testes.** Os payloads usados no teste do renderizador são **os exemplos
literais do PDF**:

| Teste | O que protege |
|---|---|
| Renderiza os 4 tipos de item | O `FORMULARIO` do Anexo 1 monta corretamente |
| Envia `body` + valores digitados | A regra central do protocolo |
| Mantém valor inicial não tocado | O bug silencioso do campo pré-preenchido |
| `SELECAO` envia o `body` do item | Contrato das opções |
| Item sem `body` navega, não posta | Evita `POST` por item na lista de pautas |
| "Cancelar" não envia dados | Cancelar não pode registrar voto |
| `botaoOk` sem `body` navega | Evita `405` no endpoint de resultado |
| Campo desconhecido não quebra a tela | Sobrevivência a um servidor mais novo |
| API indisponível exibe alerta | Erro legível em vez de tela em branco |
| Conversão de data (5 casos) | `dd/MM/yyyy` ↔ ISO, ida e volta |

---

## Decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Estado de servidor | React Query | Cache, revalidação e estados de carga prontos. Reimplementar com `useEffect` é onde nascem os bugs de tela desatualizada após uma ação |
| Estilo | CSS puro com custom properties | São poucas telas; uma biblioteca de UI traria mais peso de bundle e configuração do que código economizado |
| Tipos | TypeScript estrito | O renderizador lida com JSON de estrutura variável — é onde o compilador mais ajuda |
| URL da API | Variável de ambiente | Espelha, no cliente, a mesma decisão que o backend tomou para as URLs de callback |
| Contador de sessão | Valor vindo do servidor | Um `setInterval` local divergiria do relógio do servidor com a aba em segundo plano, e passaria a mentir sobre o prazo |
| Erros | `detail` do ProblemDetail | O backend já escreve a mensagem para o usuário final. "Request failed with status code 409" não ajuda ninguém |

---

## Deploy

### Render (configurado)

O frontend é um **site estático**: não hiberna, não tem cold start e é gratuito.

1. Entre em https://render.com com a conta do GitHub.
2. **Blueprints → New Blueprint Instance** → selecione este repositório.
3. Defina `VITE_API_BASE_URL` no painel com a URL pública da API (sem o sufixo
   `/api/v1`) e dispare um novo deploy.

O passo 3 não é opcional nem adiável: o Vite injeta essa variável em tempo de
**build**, então mudar o valor exige reconstruir o bundle. É por isso que o
primeiro deploy sai apontando para o valor padrão.

Por fim, libere a origem do frontend no backend, em `APP_CORS_ALLOWED_ORIGINS` —
**sem barra no final**, porque o navegador envia o header `Origin` sem ela.

### Qualquer outra plataforma

O resultado de `npm run build` é um diretório `dist/` de arquivos estáticos, que
qualquer CDN serve — Cloudflare Pages, Vercel, Netlify, S3. Só há dois
requisitos:

- **Rewrite de SPA:** toda rota desconhecida deve devolver `index.html`.
- **`VITE_API_BASE_URL` no ambiente de build**, não no de execução.

---

## Estrutura

```
src/
├── api/          Cliente HTTP e tipos da API REST v1
├── mobile/       Renderizador Server-Driven UI (Anexo 1)
├── painel/       Painel administrativo sobre a API REST
├── estilos/      CSS global responsivo
└── testes/       Vitest + Testing Library
```
