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

## Docker

O `vite-project/Dockerfile` gera o build com o Node 22 e serve o `dist/` pelo nginx (`vite-project/nginx.conf`), com fallback para o `index.html` nas rotas do React Router.

O `VITE_API_URL` entra no build como argumento (padrão `http://localhost:8080`). Ele é lido pelo navegador, então precisa ser um endereço que a máquina do usuário alcance, e não o nome de um container.

```bash
cd vite-project
docker build -t kl-club-dashboard .                                            # API em http://localhost:8080
docker build -t kl-club-dashboard --build-arg VITE_API_URL=http://outro:8080 .  # outra API
docker run --rm -p 5173:80 kl-club-dashboard
```

Para subir junto com o backend e o MySQL, use o `docker-compose.yml` do repositório do backend, clonado ao lado deste com o nome `backend` (veja a seção "Rodando com Docker" no README do backend). Nele o dashboard fica em **http://localhost:5173**.

## Documentação

As convenções, o contrato com a API e as regras das telas estão em [`vite-project/AGENTS.md`](vite-project/AGENTS.md).
