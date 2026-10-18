# Passe Liga

Aplicação web fullstack que simula o mercado de jogadores de uma liga de futebol fictícia: cadastro de jogadores e clubes, compra e venda com contrato de fidelidade, histórico de transações, escalação, partidas e classificação.

- [`backend/`](backend/README.md): API REST em NestJS com Prisma e PostgreSQL (variáveis de ambiente, estrutura, bibliotecas, decisões e diferenciais).
- [`frontend/`](frontend/README.md): interface em React com Vite e TypeScript (estrutura, bibliotecas, variáveis de ambiente e diferenciais).

## Pré-requisitos

| Ferramenta | Versão |
| --- | --- |
| Node.js (com npm) | 22 LTS, versão 22.22 ou mais nova (exigida pelo React Router do frontend) |
| Docker Engine com Docker Compose | Compose v2 |
| PostgreSQL | 16 (sobe pelo Docker Compose, não precisa instalar) |

## Como executar

Os comandos abaixo rodam no Ubuntu 24.04, na ordem em que aparecem, a partir da raiz do repositório.

```bash
# 1. Banco de dados (na raiz do repositório; espera o banco ficar pronto)
docker compose up -d --wait db

# 2. Backend (a partir da raiz do repositório)
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run build
npm run start:prod
```

A API fica em **http://localhost:3000** (as rotas usam o prefixo `/api/v1`, como em `http://localhost:3000/api/v1/players`).

O `.env` precisa ser copiado antes do `npm ci`, porque a instalação gera o cliente do Prisma e ele lê o `DATABASE_URL` desse arquivo.

Com a API rodando, em **outro terminal**, a partir da raiz do repositório:

```bash
# 3. Frontend
cd frontend
npm ci
npm run dev
```

A interface fica em **http://localhost:5173**. Ela usa a API em `http://localhost:3000/api/v1` por padrão; para outro endereço, veja as variáveis de ambiente em [`frontend/README.md`](frontend/README.md).

## Banco de dados

O banco é criado pelas migrations versionadas em [`backend/prisma/migrations`](backend/prisma/migrations), aplicadas pelo `npx prisma migrate deploy` do passo 2. Ele começa vazio, sem jogadores, clubes, transações nem partidas.

Para **recriar o banco do zero** (apagar tudo e aplicar as migrations de novo), com o banco no ar:

```bash
# na pasta backend
npx prisma migrate reset --force --skip-generate
```

A API pode continuar rodando durante a recriação.

Os arquivos de trava das dependências (`backend/package-lock.json` e `frontend/package-lock.json`) estão versionados.

## Funcionalidades não implementadas

- **Docker Compose completo** (diferencial): o Compose sobe só o banco; a API roda pelos comandos acima.

## Uso de inteligência artificial

### Planejamento da API

- **Ferramenta:** Claude (claude.ai), em conversa.
- **Onde e como:** antes de programar, usei a conversa para analisar a melhor forma de construir a API com boas práticas nas ferramentas escolhidas (NestJS, Prisma e PostgreSQL). O resultado foi:
  - **Estrutura de pastas:** um módulo por área do negócio (`players`, `clubs`, `market`, `league`); as regras de cálculo isoladas em `domain/`, sem acesso ao banco e com testes; o código compartilhado em `common/`.
  - **Separação em camadas:** o controller só recebe o pedido, o service valida, acessa o banco e chama o domínio, e o presenter monta a resposta.
  - **Fluxo de desenvolvimento:** uma etapa por vez, na ordem em que o sistema funciona: banco e clubes, jogadores, compra e venda, histórico e exportação, e por fim escalação, partidas e classificação. Cada etapa testada e registrada num commit antes da seguinte.
- **Por quê:** o enunciado tem muitas regras que dependem umas das outras. Planejar a estrutura e a ordem antes evitou retrabalho e manteve cada regra num lugar só.
- **O que aceitei, alterei ou descartei:** segui a estrutura de módulos e a ordem das etapas, ajustando ao enunciado à medida que cada funcionalidade era implementada.

### Revisão, ajustes e entrega

- **Ferramenta:** Claude Code (Anthropic), extensão do VS Code.
- **Onde e como:**
  - **Correção de erros de compilação:** função duplicada, imports e nomes de variáveis em `clubs.service.ts` e `market.service.ts`, depois de integrar os contratos ao clube.
  - **Revisão contra o enunciado e o barema:** comparação de cada endpoint com as regras e os exemplos do enunciado. A revisão não encontrou divergências e serviu para priorizar o que faltava.
  - **Refatoração para remover duplicação e código morto:** leitores de entrada em `common/body.ts`, validação de id em `common/limits.ts`, uso único do `lockClub` e remoção do "Hello World" do projeto inicial.
  - **Configuração:** carregamento do `.env` com `dotenv`, Prettier com o script `format:check`, `postinstall` com `prisma generate` e healthcheck do banco no `docker-compose.yml`.
  - **Diferenciais:** middleware de log das requisições (`common/request-logger.ts`) e documentação Swagger (`common/api-docs.ts` e os arquivos `*.docs.ts`).
  - **Testes de ponta a ponta** (`backend/test/`): escrita do roteiro da API na ordem do barema. Conferi que a suíte falha quando uma regra é quebrada de propósito (mudando o teto da multa).
  - **Este README:** os passos foram testados num clone limpo do repositório.
- **Por quê:** acelerar a revisão das regras, que são muitas e detalhadas, e encontrar problemas de entrega, como o cliente do Prisma que não era gerado numa instalação limpa.
- **O que aceitei, alterei ou descartei:**
  - Revisei cada mudança antes do commit e conferi com os testes automatizados e com a API rodando.
  - Descartei a ideia inicial de criar restrições CHECK no banco, porque o barema não as avalia.
  - Preferi um middleware de log a um interceptor, porque o interceptor não registra as requisições recusadas antes do controller.

### Frontend

- **Ferramenta:** Claude Code (Anthropic), extensão do VS Code.
- **Onde e como:** usei a IA como tutora para aprender React, etapa por etapa: projeto e ferramentas, rotas, camada de API, componentes reutilizáveis, lista de jogadores, formulários, clubes, compra e venda, histórico, escalação, partidas e classificação. Em cada etapa, a IA explicava o conceito e o código; eu escrevia os arquivos e ela revisava (lint, formatação, testes e build), apontando os erros. Em algumas etapas, pedi que ela aplicasse o código e me explicasse cada parte. Também usei a IA para popular o banco de desenvolvimento com dados de teste, por um script local que chama a API e não faz parte do repositório.
- **Por quê:** eu não conhecia React, e o prazo era curto. O formato de aula me permitiu entender cada parte para conseguir explicá-la.
- **O que aceitei, alterei ou descartei:** troquei as sugestões iniciais de TanStack Query e de React Hook Form com Zod por soluções mais simples e alinhadas ao enunciado (um hook próprio `useFetch` com `useState` e `useEffect`, e formulários controlados com validação própria), para usar só o que consigo explicar.
