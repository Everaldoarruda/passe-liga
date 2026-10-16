# Backend: Passe Liga API

API REST em **NestJS 12** (Node.js 22 e TypeScript), com **Prisma 6** e **PostgreSQL 16**. As rotas usam o prefixo `/api/v1`.

Os pré-requisitos, a instalação, a execução e a recriação do banco estão no [README da raiz](../README.md).

## Variáveis de ambiente

O modelo está em [`.env.example`](.env.example). Copie-o para `.env` (`cp .env.example .env`); os valores padrão funcionam com o banco do `docker-compose.yml`.

| Variável | Para que serve | Valor no `.env.example` |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL, usada pelo Prisma | `postgresql://passe:passe@localhost:5432/passe` |
| `PORT` | Porta da API | `3000` |
| `FRONTEND_ORIGIN` | Única origem liberada no CORS | `http://localhost:5173` |
| `TEST_DATABASE_URL` | Banco separado usado só pelos testes de ponta a ponta (apagado a cada execução) | `postgresql://passe:passe@localhost:5432/passe_test` |

## Comandos

Todos rodam na pasta `backend`.

| Comando | O que faz |
| --- | --- |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Sobe a API compilada |
| `npm run start:dev` | Sobe a API em modo de desenvolvimento, recompilando a cada mudança |
| `npm test` | Roda os testes unitários e termina sozinho |
| `npm run test:e2e` | Compila a API e roda os testes de ponta a ponta contra ela, no banco `TEST_DATABASE_URL` (precisa do banco no ar) |
| `npm run lint` | Verifica o código com o oxlint |
| `npm run format:check` | Verifica a formatação com o Prettier, sem alterar arquivos |
| `npm run format` | Corrige a formatação |

## Diferenciais

- **Testes automatizados:** `npm test` roda os testes do domínio e das validações de entrada, termina sozinho (sem modo de observação) e inclui os exemplos das tabelas do enunciado, entre eles o cálculo do valor de mercado (RN02 a RN05) em `src/domain/market-value.spec.ts`. Além deles, `npm run test:e2e` percorre o roteiro da API na ordem do barema (B01 a B22): sobe a API compilada sobre um banco de teste vazio e confere, por HTTP, os códigos, os corpos, os cabeçalhos e que nada é gravado nas recusas.
- **Documentação interativa (Swagger/OpenAPI):** com a API no ar, abra **http://localhost:3000/api/docs**. Todos os endpoints do enunciado aparecem com exemplos de corpo e de query params prontos para enviar.
- **Log de cada requisição:** com a API no ar, cada requisição gera uma linha na saída da aplicação, pelo `Logger` do NestJS, com data e hora, método, caminho e status:
  ```
  [Nest] 30868  - 15/10/2026, 23:32:22     LOG [HTTP] GET /api/v1/players/7 200
  ```
- **Lint e formatação:** `npm run lint` e `npm run format:check`; os dois terminam sem erros, e o de formatação só verifica.

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma     # modelo das 7 tabelas
│   └── migrations/       # migrations SQL versionadas (criam e recriam o banco)
└── src/
    ├── main.ts           # inicialização: .env, log, prefixo /api/v1, CORS, filtro de erros e Swagger
    ├── app.module.ts
    ├── common/           # código compartilhado: filtro global de erros, leitura e validação de entrada,
    │                     # trava do clube (SELECT ... FOR UPDATE), log de requisições e Swagger
    ├── domain/           # regras de negócio puras, sem banco: valor de mercado, overall e valor base,
    │                     # taxa, multa, comissão, escalação, partida, classificação, datas e dinheiro
    ├── players/          # jogadores: cadastro, listagem, edição, condição e exclusão lógica
    ├── clubs/            # clubes: criação, listagem e consulta com elenco e contratos
    ├── market/           # compra, venda, histórico de transações e exportação CSV
    ├── league/           # escalação, partidas e classificação
    └── prisma/           # PrismaService (conexão com o banco)
test/
├── roteiro.e2e-spec.ts   # testes de ponta a ponta, na ordem do roteiro do barema
├── api.ts                # cliente HTTP dos testes
└── global-setup.ts       # prepara o banco de teste e sobe a API (global-teardown.ts a encerra)
```

Cada módulo separa as camadas: o **controller** só recebe o pedido e chama o serviço; o **service** valida a entrada, acessa o banco e chama o domínio; o **presenter** monta a resposta. Os cálculos ficam em `domain/`, cada um em um só lugar, com testes ao lado (`*.spec.ts`).

## Bibliotecas

**Dependências da aplicação**

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` | Framework NestJS sobre o Express (stack obrigatória) |
| `@nestjs/swagger` | Documentação interativa da API (Swagger/OpenAPI) |
| `@prisma/client` | ORM: consultas tipadas e parametrizadas ao PostgreSQL |
| `dotenv` | Carrega o `.env` para as variáveis de ambiente da API e da CLI do Prisma |
| `reflect-metadata`, `rxjs` | Exigidas pelo NestJS (decoradores e fluxo interno das requisições) |

**Dependências de desenvolvimento**

| Biblioteca | Motivo |
| --- | --- |
| `prisma` | CLI do Prisma: migrations e geração do cliente |
| `typescript` | Linguagem do projeto |
| `@nestjs/cli`, `@nestjs/schematics` | Build e execução pela CLI do NestJS |
| `jest`, `ts-jest`, `@types/jest` | Testes automatizados em TypeScript |
| `ts-node` | Permite ao Jest ler a configuração em TypeScript (`jest.config.ts`) |
| `tsconfig-paths` | Usada pelo script `test:debug` |
| `oxlint`, `oxlint-tsgolint` | Lint, com regras que usam os tipos do TypeScript |
| `prettier` | Formatação do código |
| `@types/express`, `@types/node` | Tipos do Express e do Node.js |

## Decisões e premissas

- **Dinheiro em centavos inteiros:** os cálculos usam centavos inteiros, para não ter erro de ponto flutuante, e arredondam uma única vez, no resultado final, com o meio para longe do zero, como manda a premissa de arredondamento do enunciado. No banco, os valores ficam em `DECIMAL`.
- **Listagem de jogadores em memória:** o valor de mercado depende da condição, da agilidade e da idade e não pode ser coluna. Por isso a listagem lê os jogadores ativos e faz a busca, o filtro e a ordenação por valor, e depois a paginação, na aplicação. O volume da liga é pequeno (até 20 clubes com 12 jogadores, mais os livres). A ordenação de clubes pelo patrimônio segue a mesma lógica.
- **Concorrência:** compra, venda, escalação e partida rodam numa transação e começam travando a linha do clube (`SELECT ... FOR UPDATE`). Assim, duas operações do mesmo clube não usam o mesmo caixa ao mesmo tempo. A compra só coloca o jogador no clube se ele ainda estiver livre (atualização condicional), e a venda, só se ele ainda for do clube.
- **Recompra:** o clube não pode comprar um jogador se já existe uma transação `VENDA` desse jogador por ele, em qualquer momento. Outros clubes podem.
- **Nome único do clube:** o banco tem um índice único sobre `lower(nome)`, que ignora maiúsculas e minúsculas e respeita os acentos ("Águias FC" e "águias fc" são iguais; "Aguias FC" é outro nome). Antes de gravar, a aplicação faz a mesma checagem para responder 409 com uma mensagem clara.
- **Ordem das validações:** primeiro o formato do pedido (400), depois a existência dos recursos (404) e por fim as regras de negócio (409). As validações de entrada são funções reutilizáveis (`common/body.ts`, `common/query.ts` e os arquivos `*-input.ts` de cada módulo), chamadas antes da lógica de cada endpoint.
- **Datas:** gravadas como `TIMESTAMP` em UTC e devolvidas no horário de Brasília (`AAAA-MM-DDTHH:MM:SS-03:00`). O "agora" das regras é o relógio do servidor no momento da operação.
- **Query params:** parâmetro repetido é recusado com 400, como o parâmetro vazio. No `GET /players`, um `club_id` inexistente gera 404 depois das demais validações.
- **Desempates finais:** quando o enunciado manda desempatar pelo nome, o último critério é o id crescente, para a ordem ser sempre a mesma, inclusive na classificação.
- **Exportação CSV:** além de `text/csv`, a resposta traz `Content-Disposition` com o nome `transacoes.csv`, para o navegador baixar o arquivo.
- **Swagger e log:** a documentação fica em `/api/docs`, fora do prefixo `/api/v1`. O log mostra o caminho com a query string.
