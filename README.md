# frontend-dashboard

Painel administrativo de pedidos do KL Club (Visão Geral, Pedidos de Hoje e Histórico) feito com **React 19 + Vite**. Consome a API do [backend](../backend) em `http://localhost:8080`.

O código fica na pasta [`vite-project/`](vite-project/).

## Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** (ou 22.12+), exigido pelo Vite 8
- O backend rodando, com o MySQL e os dados de exemplo (veja o README do backend)

## Como rodar

```bash
cd vite-project

# 1. Instalar as dependências
npm install

# 2. (Opcional) Criar o arquivo de ambiente a partir do exemplo
cp .env.example .env        # no Windows (PowerShell): Copy-Item .env.example .env

# 3. Subir o front
npm run dev
```

Abra **http://localhost:5173** e entre com um funcionário dos dados de exemplo, por exemplo `juliana.ribeiro@klclub.com.br` com a senha `Senha@123`.

Telas: `/login`, `/dashboard`, `/pedidos/hoje` e `/pedidos/historico`.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | Endereço da API |

## Scripts

Todos rodam dentro de `vite-project/`:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o front (Vite) |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Roda o lint (oxlint) |

## Documentação

As convenções, o contrato com a API e as regras das telas estão em [`vite-project/AGENTS.md`](vite-project/AGENTS.md).
