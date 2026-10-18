# Frontend: Passe

Interface em **React 19** com **Vite** e **TypeScript**, que consome a API do backend. Os pré-requisitos e a ordem de execução (banco, backend e frontend) estão no [README da raiz](../README.md).

## Como executar

Com a API rodando em `http://localhost:3000`, na pasta `frontend`:

```bash
npm ci
npm run dev
```

A interface fica em **http://localhost:5173**.

## Variáveis de ambiente

| Variável       | Para que serve                           | Padrão                         |
| -------------- | ---------------------------------------- | ------------------------------ |
| `VITE_API_URL` | Endereço da API, com o prefixo `/api/v1` | `http://localhost:3000/api/v1` |

O modelo está em [`.env.example`](.env.example). O arquivo `.env` é **opcional**: sem ele, a interface usa o padrão acima. Para mudar, copie o modelo (`cp .env.example .env`) e ajuste o valor.

## Comandos

Todos rodam na pasta `frontend`.

| Comando                | O que faz                                                              |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Sobe a interface em modo de desenvolvimento, em http://localhost:5173  |
| `npm run build`        | Confere os tipos e gera a versão de produção em `dist/`                |
| `npm test`             | Roda os testes de componente e termina sozinho, sem modo de observação |
| `npm run lint`         | Verifica o código com o Oxlint                                         |
| `npm run format:check` | Verifica a formatação com o Prettier, sem alterar arquivos             |
| `npm run format`       | Corrige a formatação                                                   |

## Diferenciais

- **Testes no frontend:** `npm test` roda os testes de componente e de funções (Vitest e Testing Library) e termina sozinho.
- **Lint e formatação:** `npm run lint` e `npm run format:check` terminam sem erros; o de formatação só verifica.

## Estrutura de pastas

```
src/
├── api/          # camada de acesso à API: cliente HTTP, tipos e uma função por endpoint
├── components/   # componentes reutilizáveis: tabela, campo, botão, modal, formulários
├── hooks/        # useFetch (busca de dados) e useSubmit (envio de ações com mensagens)
├── lib/          # formatação de moeda e data, validação dos formulários, nomes em português
├── pages/        # telas: jogadores, clubes, clube, partidas e classificação
├── App.tsx       # rotas
└── main.tsx      # inicialização
```

Nenhum componente chama a API diretamente: todas as chamadas ficam em `src/api/`, e as telas usam os hooks `useFetch` e `useSubmit`.

## Bibliotecas

**Dependências da aplicação**

| Biblioteca           | Motivo                                               |
| -------------------- | ---------------------------------------------------- |
| `react`, `react-dom` | Biblioteca de interface (stack obrigatória)          |
| `react-router`       | Rotas das telas, no modo biblioteca                  |
| `sonner`             | Avisos de sucesso e de erro (com o `message` da API) |
| `lucide-react`       | Ícones do menu                                       |

**Dependências de desenvolvimento**

| Biblioteca                                            | Motivo                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `vite`, `@vitejs/plugin-react`                        | Servidor de desenvolvimento e build                             |
| `typescript`                                          | Tipagem do código                                               |
| `tailwindcss`, `@tailwindcss/vite`                    | Estilos por classes utilitárias, inclusive para telas estreitas |
| `vitest`, `jsdom`                                     | Execução dos testes, com um navegador simulado                  |
| `@testing-library/react`, `@testing-library/jest-dom` | Testes de componente pelo que o usuário vê                      |
| `oxlint`                                              | Lint                                                            |
| `prettier`                                            | Formatação                                                      |
| `@types/node`, `@types/react`, `@types/react-dom`     | Tipos do Node.js e do React                                     |

## Decisões

- **Busca de dados com um hook próprio (`useFetch`)**, com `useState` e `useEffect`, em vez de uma biblioteca, para seguir o que o enunciado sugere e manter o código simples de explicar. O hook ignora respostas atrasadas e tem um `reload()` para atualizar a tela depois de cada ação.
- **Formulários controlados** com validação própria (`src/lib/validation.ts`): obrigatórios, tamanho dos textos e faixas numéricas, com a mensagem junto ao campo. As regras que cruzam campos, que dependem do momento atual ou do banco ficam com a API, e a tela mostra o `message` devolvido.
- **Nenhum valor calculado pela API é recalculado na tela.** A única conta é o custo total da compra (valor + taxa), que o enunciado permite.
- **Datas:** exibidas no horário de Brasília; a data digitada na compra é enviada com `-03:00`.
- **Recusas previsíveis impedidas na tela:** "só livres" junto com o filtro por clube, de Doente direto para Apto, mudança de posição de jogador com clube e idade menor que a atual.
