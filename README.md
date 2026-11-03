# frontend-dashboard

Painel administrativo de pedidos (Visão Geral, Pedidos de Hoje e Histórico) feito com **React 19 + Vite**. Durante o desenvolvimento o back-end é simulado por um servidor de mock baseado no **json-server**.

O código fica na pasta [`vite-project/`](vite-project/).

## Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** (ou 22.12+), exigido pelo Vite 8
- npm (já vem com o Node)

## Como rodar

```bash
cd vite-project

# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de ambiente a partir do exemplo
cp .env.example .env        # no Windows (PowerShell): Copy-Item .env.example .env

# 3. Subir a API de mock e o front juntos
npm run dev:all
```

Depois é só abrir **http://localhost:5173** no navegador.

| Serviço | Endereço |
| --- | --- |
| Front-end (Vite) | http://localhost:5173 |
| API de mock | http://localhost:3001 |

Telas disponíveis: `/dashboard`, `/pedidos/hoje` e `/pedidos/historico`.

> Se preferir, rode cada parte em um terminal separado: `npm run api` (mock) e `npm run dev` (front).

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3001` | Endereço da API consumida pelo front |

## Dados de mock

- Na primeira execução, o servidor cria o `db.json` (não versionado) a partir do `db.example.json`.
- As datas dos pedidos são relativas ao momento em que o servidor sobe, então "hoje" sempre tem dados.
- As alterações feitas pela interface (avançar ou cancelar pedidos) ficam salvas no `db.json`. Para voltar ao estado inicial:

```bash
npm run db:reset
```

## Scripts

Todos rodam dentro de `vite-project/`:

| Comando | O que faz |
| --- | --- |
| `npm run dev:all` | Sobe a API de mock e o front juntos |
| `npm run dev` | Sobe só o front (Vite) |
| `npm run api` | Sobe só a API de mock (porta 3001) |
| `npm run db:reset` | Restaura o `db.json` a partir do `db.example.json` |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Roda o lint (oxlint) |

## Documentação

A especificação completa das telas, da API e do mock está em [`vite-project/AGENTS.md`](vite-project/AGENTS.md).