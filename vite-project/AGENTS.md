# AGENTS.md

Painel administrativo do KL Club (`frontend-dashboard`), projeto do 3º semestre de ADS. O funcionário entra com e-mail e senha e acompanha os pedidos: Visão Geral (KPIs, tabela, distribuição de pagamentos e produtos mais vendidos do dia), Pedidos de Hoje (quadro com avançar e recusar) e Histórico. Consome a API real do `backend` (`http://localhost:8080`); não há mais mock.

## Ambiguidade

Sempre que houver ambiguidade, pergunte ao responsável pelo projeto qual caminho seguir antes de continuar. Não decida sozinho.

## Comandos

O projeto Vite fica em `vite-project/`. Rode os comandos a partir dessa pasta.

```bash
npm install
npm run dev       # front em http://localhost:5173
npm run lint      # oxlint
npm run build     # build de produção em dist/
npm run preview   # serve o build
```

- Exige Node 20.19+ ou 22.12+ (Vite 8).
- O endereço da API vem de `VITE_API_URL` (`.env`, fora do git; modelo em `.env.example`). Sem a variável, o `httpClient` usa `http://localhost:8080`.
- Para rodar, o backend precisa estar no ar com o MySQL e o seed (`../backend/README.md`). Os funcionários do seed usam a senha `Senha@123`.
- Não há testes automatizados. Valide as mudanças com o backend rodando, no navegador, conferindo os números com o banco.

## Estrutura (MVVM)

O código fica em `vite-project/src/`:

| Pasta | Papel |
|---|---|
| `model/api/httpClient.js` | Instância do `axios` e `ApiError` (`status`, `codigo`, `message`, `cancelado`) |
| `model/services/` | Uma função por rota da API; devolvem os dados como a API manda |
| `model/constants/` | Enums e rótulos (`pedidos.js`), abas de período (`periodos.js`), rotas e mensagens do login (`auth.js`) |
| `model/entities/pedido.js` | Funções puras de formatação (moeda, datas, itens, telefone, rótulos) |
| `viewmodel/` | Hooks com estado e regras de cada tela; `useBloco` (bloco `{ status, data, error }`) e `usePolling` (30 s) |
| `view/` | `pages/`, `layout/AdminLayout`, `components/<Componente>/` (`.jsx` + `.module.css`) e `routes/RotaProtegida` |

Regras de dependência: a View não importa `axios` nem services; o ViewModel não tem JSX; o Model não conhece React. Componentes recebem tudo por props; só as páginas usam ViewModels.

## Convenções

- **Nomes de campo:** o front usa os nomes da API (`idPedido`, `statusPedido`, `dataHora`, `pontosGerados`, `usuario`, `nomeUsuario`, `observacoes`), sem camada de tradução. Os enums têm os mesmos valores da API (`LOCAL`, `RETIRADA`, `CREDITO`, `DEBITO` etc.).
- **O front não recalcula:** KPIs, percentuais, pontos, ranking e próximo status vêm da API. O front só formata.
- **Idioma:** código, nomes e textos em português, exceto termos técnicos de React.
- **Estilo:** CSS Modules por componente; tokens em `styles/global.css`.
- **Documentação:** mantenha este `AGENTS.md` e o `README.md` da raiz atualizados a cada mudança, na mesma alteração do código.

## Contrato com a API

As rotas, os códigos de erro e as regras completas estão em `../backend/README.md` e em `../backend/Especificação de Pedidos.md` (não versionada). Mudanças no contrato começam no backend.

| Tela | Rotas |
|---|---|
| Login | `POST /funcionarios/login` com `{ email, senha }` → `{ idFuncionario, nome, email, nivel, ativo }` |
| Visão Geral | `GET /pedidos/dashboard/kpis`, `/tabela`, `/pagamentos` e `/produtos-mais-vendidos`, sempre com `periodo=HOJE` |
| Pedidos de Hoje | `GET /pedidos/gestao/novos`, `/em-preparo`, `/prontos`, `/concluidos`; `PATCH /pedidos/{id}/avancar` e `/cancelar`, sem corpo |
| Histórico e selos | `GET /pedidos/historico` com `idPedido`, `nomeUsuario`, `dataInicio`, `dataFim`, `modalidade`, `ordenarPor=valor`, `direcao`, `pagina`, `tamanho` |

- **Erros:** `ProblemDetail` com `codigo`. Conflito na gestão (`409`/`404`), `401` no login e falta de conexão têm textos próprios do front; os demais erros mostram o `detail` da API, ou a mensagem genérica se ele vier vazio.
- **Datas:** a API manda datas sem fuso, no horário de São Paulo. `lerDataApi` (`model/entities/pedido.js`) acrescenta `-03:00`, para a hora sair igual em qualquer fuso do navegador.
- **Dinheiro:** número em reais, formatado com `Intl.NumberFormat('pt-BR')`. Percentuais são exibidos inteiros.

## Regras de tela

- **Sessão:** a API não gera token. A sessão (`sessionStorage`, chave `klclub.sessao`) guarda só o funcionário, e a `RotaProtegida` bloqueia as telas no front. Não há controle por `nivel`: todos veem tudo.
- **Pedido `PENDENTE`** (dinheiro, pago no balcão): o cartão fica com fundo e borda azul-petróleo (`--pagar-balcao` e `--pagar-balcao-bg`), para se distinguir dos já pagos, e mostra "Pagar no balcão" e o botão "Receber e aceitar", que pede confirmação e chama o mesmo `avancar`. Depois de recebido, o pedido está pago e volta à cor da coluna.
- **Pedido sem cliente:** o nome aparece como "Sem cadastro", em tom apagado, sem chip de pontos (na tabela da Visão Geral, "—").
- **Recusar** pede confirmação e chama `cancelar`; o texto não fala em estorno.
- **Conflito:** `409` ou `404` numa ação mostra "Este pedido já foi atualizado por outra pessoa" e recarrega as quatro listas. Dois "avançar" simultâneos movem o pedido duas etapas sem erro (comportamento aceito na spec).
- **Atualização automática** a cada 30 s, pausada com a aba oculta e durante uma ação.
- **Ranking:** a API devolve até 5 produtos; a tela mostra 3.
- **Distribuição:** crédito (grafite) e débito (grafite claro) aparecem separados.
- **Selos:** o item "Pedidos" do menu mostra os pedidos de hoje ainda não concluídos (Novos + Em Preparo + Prontos) e some quando o número é zero; a aba "Pedidos de Hoje" mostra a soma das 4 colunas; a aba "Histórico de Pedidos", o total do histórico. As contagens ficam em `contarHoje` (`useResumoPedidosViewModel`), e o quadro as informa ao layout depois de cada ação (`informarHoje`), sem esperar o polling.
- As abas de período fora de HOJE, "Novo Pedido" e "Exportar" ficam desabilitados.

## Git

- Use o git apenas para verificação (`git status`, `git diff`, `git log`, `git show`, `git ls-files`).
- Não faça commits. Também não altere o stage, as branches, o histórico nem o remoto: commits e pushes são feitos pelo responsável pelo projeto.
- Deixe as alterações na working tree e informe o que mudou.

## Estado atual

- Integração com o backend concluída em 04/11/2026, com o mock (`mock/`, `db.example.json`) removido. As dependências `json-server` e `concurrently` continuam no `package.json`, sem uso, por decisão do responsável.
- Em modo dev, o `StrictMode` dispara cada efeito duas vezes, e a primeira leva de requisições é abortada. A aba Network mostra essas requisições como canceladas (a extensão do Chrome as exibe como `503`); não são erros da API.
- O `detail` de alguns erros de parâmetro cita o nome técnico do campo (ex.: "O idPedido é inválido").
- Sem token, um funcionário desativado com a sessão aberta continua no painel até fechar a aba.
