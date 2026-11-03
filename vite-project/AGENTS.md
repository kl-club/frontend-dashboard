# Especificação de Pedidos — Front-end

> Dashboard, Gestão de pedidos e Histórico.
> **Escopo desta sprint: somente o dia de HOJE.** Ontem, 7 dias, mensal e anual ficam para a próxima sprint.

## 1. Como ler este documento

Este documento deriva da especificação de back-end do recurso `/pedidos` e das três telas do protótipo:

| Código | Tela |
| --- | --- |
| **T1** | Visão Geral (dashboard) |
| **T2** | Gestão de Pedidos — aba Histórico de Pedidos |
| **T3** | Gestão de Pedidos — aba Pedidos de Hoje (quadro de status) |

Cada informação carrega uma etiqueta de origem:

- **[Spec]** vem da especificação original de back-end.
- **[Protótipo]** aparece nas telas, mas a especificação original não cobre. Precisa de confirmação do back-end.
- **[Proposta]** decisão sugerida pelo front para destravar o desenvolvimento. Pode mudar depois do alinhamento.

Regra geral: o front **exibe** o que a API devolve e não recalcula KPIs, percentuais, pontos nem ranking. A única exceção é o mock da seção 7, que faz o papel do back-end durante o desenvolvimento.

## 2. Escopo da sprint

| Área | Dentro da sprint (HOJE) | Fora da sprint |
| --- | --- | --- |
| Dashboard (T1) | Período `HOJE`; 4 KPIs; tabela de pedidos; distribuição de pagamentos; produtos mais vendidos | Abas ONTEM, 7 DIAS, MENSAL e ANUAL (aparecem desabilitadas); comparação com o período anterior equivalente |
| Gestão (T3) | 4 listas por status; avançar status; cancelar (Recusar); atualização automática a cada 30 s | — |
| Histórico (T2) | GET paginado com filtros (código, cliente, data, modalidade) e ordenação por valor | — |
| Layout | Menu lateral, barra superior, abas Pedidos de Hoje / Histórico | Cardápio, KL CLUB, Clientes, Sair (itens visíveis, sem funcionalidade) |
| Botões sem contrato | — | Novo Pedido, Exportar e busca por item do pedido (aparecem desabilitados) |

**Premissa sobre o Histórico [Proposta]:** o Histórico tem filtro de data próprio e não depende das abas de período do dashboard, então continua nesta sprint. Ele fica isolado na branch `feat/historico-pedidos` e pode sair da sprint sem afetar o resto.

## 3. Arquitetura (MVVM)

**Stack:** React (JSX) com Vite, HTML semântico, CSS Modules, `react-router-dom` v6 e `axios`. Dados de teste com `json-server`.

```text
vite-project/src/
├── model/
│   ├── api/httpClient.js                  # axios (já existe) — ver 3.1
│   ├── constants/periodos.js              # abas de período e flag "habilitado"
│   ├── constants/pedidos.js               # status, modalidades, formas de pagamento, listas
│   ├── entities/pedido.js                 # funções puras: formatadores e rótulos
│   └── services/
│       ├── dashboardService.js            # kpis, tabela, pagamentos, produtos
│       ├── gestaoPedidosService.js        # listas, avançar, cancelar
│       └── historicoPedidosService.js     # busca paginada
├── viewmodel/
│   ├── useDashboardViewModel.js
│   ├── useGestaoPedidosViewModel.js
│   ├── useHistoricoPedidosViewModel.js
│   └── usePolling.js
└── view/
    ├── layout/AdminLayout/                # menu lateral + barra superior
    ├── components/<Componente>/           # cada componente em sua pasta: .jsx + .module.css
    └── pages/
        ├── DashboardPage/
        └── PedidosPage/                   # abas Hoje | Histórico
```

**Regras de dependência**

- A View não chama `axios`. Ela só recebe dados e funções do ViewModel.
- O ViewModel (hooks) não contém JSX.
- O Model não conhece React.
- Componentes visuais recebem tudo por props; só as páginas usam os ViewModels.

### 3.1 Ajuste no `httpClient`

O interceptor atual troca qualquer erro por uma mensagem genérica e perde o status HTTP. Nesta sprint o ViewModel precisa distinguir erros, em especial `409 TRANSICAO_INVALIDA`. O interceptor deve devolver um erro que preserve:

- `status`: código HTTP (`undefined` quando não há resposta, ou seja, sem conexão);
- `codigo`: campo `codigo` do corpo da resposta, quando existir;
- `message`: mensagem amigável (a do corpo da resposta, ou a genérica).

### 3.2 Rotas

| Rota | Conteúdo |
| --- | --- |
| `/login` | Login do funcionário (pública; ver §14) |
| `/dashboard` | Visão Geral (T1) |
| `/pedidos` | Redireciona para `/pedidos/hoje` |
| `/pedidos/hoje` | Pedidos de Hoje (T3) |
| `/pedidos/historico` | Histórico de Pedidos (T2) |

As demais rotas exigem sessão (§14): sem login, vão para `/login`. A rota `/cadastro` (fluxo do QR Code) não muda.

## 4. Contrato de dados

### 4.1 Convenções

- Valores monetários: número em reais com duas casas (`65.40`), nunca texto. Formatação no front com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Datas: ISO 8601 com fuso (`2026-11-02T14:07:00-03:00`). O "dia" do pedido é a data de criação em `America/Sao_Paulo` **[Spec]**.
- Percentuais: número (`40` significa 40%).
- Campos opcionais podem vir `null` ou ausentes. O front trata os dois casos.
- Valores desconhecidos de enumeração nunca quebram a tela: o front mostra o código bruto como rótulo.

### 4.2 Enumerações

| Enumeração | Valores | Rótulo exibido |
| --- | --- | --- |
| `status` **[Spec]** | `PENDENTE`, `PAGO`, `EM_PREPARO`, `PRONTO_PARA_RETIRADA`, `CONCLUIDO`, `CANCELADO` | Usado só para decidir a coluna/estilo; não é exibido como texto |
| `modalidade` **[Spec]** | `RETIRADA` | Retirada Balcão |
| | `CONSUMO_LOCAL` | Consumo Local |
| `formaPagamento` (pedido) **[Proposta]** | `PIX` | PIX Instantâneo |
| | `CARTAO_CREDITO` | Cartão de Crédito |
| | `CARTAO_DEBITO` | Cartão de Débito |
| | `DINHEIRO` | Dinheiro |
| | `VOUCHER` | Voucher |
| `forma` (distribuição) **[Proposta]** | `PIX` | PIX (Instantâneo) |
| | `CARTAO` (crédito + débito somados) | Cartão de Crédito / Débito |
| | `DINHEIRO` | Dinheiro (Espécie) |
| | `VOUCHER` | VR / Refeição / Vouchers |

### 4.3 Objeto `Pedido`

Usado nas tabelas, no quadro de status e no histórico. Cada tela usa só os campos de que precisa.

| Campo | Tipo | Origem | Observação |
| --- | --- | --- | --- |
| `id` | número | **[Spec]** | É o código do pedido, exibido como `#1084` |
| `status` | texto | **[Spec]** | Ver 4.2 |
| `modalidade` | texto | **[Spec]** | Ver 4.2 |
| `mesa` | texto | **[Protótipo]** | Só em `CONSUMO_LOCAL` (ex.: `"02"`) |
| `criadoEm` | data-hora | **[Spec]** | Data de criação |
| `cliente.id` | número | **[Spec]** | Todo pedido tem cliente |
| `cliente.nome` | texto | **[Spec]** | |
| `cliente.telefone` | texto | **[Protótipo]** | Só dígitos (`11988412290`); o front aplica a máscara |
| `itens[].nome` | texto | **[Spec]** | |
| `itens[].quantidade` | número | **[Protótipo]** | A spec cita só o nome; as telas mostram `2× Suco Verde` |
| `itens[].valorTotal` | número | **[Protótipo]** | Valor da linha (quantidade × preço); usado em T3 |
| `observacao` | texto | **[Protótipo]** | Ex.: "Sem wasabi e molho à parte" |
| `formaPagamento` | texto | **[Spec]** | Ver 4.2 |
| `valorTotal` | número | **[Spec]** | |
| `pontosGanhos` | número | **[Spec]** | `0` em pedido cancelado |
| `origem.tipo` / `origem.identificacao` | texto | **[Protótipo]** | Ex.: `TOTEM` / `Kiosk 02` |
| `motivoCancelamento` | texto | **[Protótipo]** | Ex.: "Cancelado pelo cliente" |

Exemplo completo:

```json
{
  "id": 1049,
  "status": "PENDENTE",
  "modalidade": "RETIRADA",
  "mesa": null,
  "criadoEm": "2026-11-02T14:07:00-03:00",
  "cliente": { "id": 312, "nome": "Mariana Rios", "telefone": "11988410022" },
  "itens": [
    { "nome": "Bowl Salmão Fresh & Quinoa", "quantidade": 1, "valorTotal": 48.90 },
    { "nome": "Suco Verde Desintoxicante 500ml", "quantidade": 1, "valorTotal": 16.50 }
  ],
  "observacao": "Sem wasabi e molho à parte",
  "formaPagamento": "PIX",
  "valorTotal": 65.40,
  "pontosGanhos": 65,
  "origem": { "tipo": "TOTEM", "identificacao": "Kiosk 02" },
  "motivoCancelamento": null
}
```

### 4.4 Envelope de paginação **[Proposta]**

Usado pela tabela do dashboard e pelo histórico (páginas começam em 1).

```json
{
  "conteudo": [],
  "pagina": 1,
  "tamanho": 10,
  "total": 84,
  "totalPaginas": 9
}
```

### 4.5 Erros **[Proposta]**

```json
{ "codigo": "TRANSICAO_INVALIDA", "mensagem": "O pedido #1044 já foi concluído e não pode avançar." }
```

| HTTP | `codigo` | Quando |
| --- | --- | --- |
| 404 | `PEDIDO_NAO_ENCONTRADO` | Pedido inexistente |
| 409 | `TRANSICAO_INVALIDA` | Avançar/cancelar em status que não permite **[Spec]** |
| 400 | `PARAMETRO_INVALIDO` | Período diferente de `HOJE`, datas inválidas etc. |

## 5. Endpoints

A especificação original fixa apenas o recurso `/pedidos` **[Spec]**. Os caminhos abaixo são **[Proposta]**. Ao receber os caminhos reais, só o Model (`services/`) muda.

| Método | Rota | Parâmetros | Tela |
| --- | --- | --- | --- |
| GET | `/pedidos/dashboard/kpis` | `periodo=HOJE` | T1 |
| GET | `/pedidos/dashboard/tabela` | `periodo=HOJE`, `pagina`, `tamanho` | T1 |
| GET | `/pedidos/dashboard/pagamentos` | `periodo=HOJE` | T1 |
| GET | `/pedidos/dashboard/produtos-mais-vendidos` | `periodo=HOJE` | T1 |
| GET | `/pedidos/gestao/novos` | — | T3 |
| GET | `/pedidos/gestao/em-preparo` | — | T3 |
| GET | `/pedidos/gestao/prontos` | — | T3 |
| GET | `/pedidos/gestao/concluidos` | — | T3 |
| PATCH | `/pedidos/{id}/avancar` | — (sem corpo) | T3 |
| PATCH | `/pedidos/{id}/cancelar` | — (sem corpo) | T3 |
| GET | `/pedidos/historico` | `codigo`, `cliente`, `dataInicio`, `dataFim`, `modalidade`, `ordenarPor`, `direcao`, `pagina`, `tamanho` | T2 |

> O `axios` usa `GET` e `PATCH` aqui. O `PATCH` já vem da especificação original; se o time preferir `PUT`, só o Model muda.

### 5.1 Dashboard

**GET `/pedidos/dashboard/kpis?periodo=HOJE`**

```json
{
  "periodo": "HOJE",
  "faturamento": { "valor": 3420.00, "meta": 3000.00 },
  "pedidos": { "quantidade": 84, "variacaoPercentual": 12.0 },
  "ticketMedio": { "valor": 40.71, "valorPeriodoAnterior": 39.85 },
  "clientesAtendidos": { "quantidade": 71, "percentualViaTotem": 83 }
}
```

Regras **[Spec]**:

- Pedidos `CANCELADO` ficam fora de todos os KPIs.
- `variacaoPercentual` = (hoje − ontem) ÷ ontem × 100; vem `null` quando ontem = 0.
- `ticketMedio.valor` = faturamento ÷ quantidade de pedidos; vem `null` quando não há pedidos. O valor do dia anterior vem só como número.
- `clientesAtendidos.quantidade` conta clientes distintos.

Campos **[Protótipo]**: `faturamento.meta` ("Meta: R$ 3.000,00") e `clientesAtendidos.percentualViaTotem` ("83% via Totem"). Se vierem ausentes, o front oculta a linha de apoio do card.

**GET `/pedidos/dashboard/tabela?periodo=HOJE&pagina=1&tamanho=4`**

Todos os pedidos do período, inclusive cancelados, do mais recente para o mais antigo **[Spec]**.

```json
{
  "conteudo": [
    {
      "id": 1084,
      "status": "CONCLUIDO",
      "cliente": { "id": 101, "nome": "Marcos Silva" },
      "itens": [
        { "nome": "Suco Verde", "quantidade": 2 },
        { "nome": "Combo Fit", "quantidade": 1 }
      ],
      "formaPagamento": "PIX",
      "valorTotal": 56.00,
      "pontosGanhos": 56
    },
    {
      "id": 1083,
      "status": "EM_PREPARO",
      "cliente": { "id": 102, "nome": "Ana Beatriz" },
      "itens": [{ "nome": "Suco Laranja Pêra", "quantidade": 1 }],
      "formaPagamento": "CARTAO_CREDITO",
      "valorTotal": 14.00,
      "pontosGanhos": 14
    }
  ],
  "pagina": 1,
  "tamanho": 4,
  "total": 84,
  "totalPaginas": 21
}
```

**GET `/pedidos/dashboard/pagamentos?periodo=HOJE`**

Valor e percentual por forma de pagamento usada no período. O percentual é sobre o **valor**, não sobre a quantidade de pedidos **[Spec]**.

```json
{
  "periodo": "HOJE",
  "faturamento": 3420.00,
  "itens": [
    { "forma": "PIX", "valor": 1368.00, "percentual": 40.0 },
    { "forma": "CARTAO", "valor": 1197.00, "percentual": 35.0 },
    { "forma": "DINHEIRO", "valor": 513.00, "percentual": 15.0 },
    { "forma": "VOUCHER", "valor": 342.00, "percentual": 10.0 }
  ]
}
```

**GET `/pedidos/dashboard/produtos-mais-vendidos?periodo=HOJE`**

Top 5 por unidades vendidas **[Spec]**. O campo `valorTotal` (R$ por produto) aparece no protótipo, mas não na spec **[Protótipo]**.

```json
{
  "periodo": "HOJE",
  "itens": [
    { "posicao": 1, "produto": { "id": 7, "nome": "Suco Verde Especial", "imagemUrl": "/img/suco-verde.jpg" }, "quantidade": 42, "valorTotal": 588.00 },
    { "posicao": 2, "produto": { "id": 9, "nome": "Suco Laranja Pêra", "imagemUrl": "/img/suco-laranja.jpg" }, "quantidade": 38, "valorTotal": 532.00 },
    { "posicao": 3, "produto": { "id": 12, "nome": "Combo Fit Treino", "imagemUrl": "/img/combo-fit.jpg" }, "quantidade": 22, "valorTotal": 616.00 },
    { "posicao": 4, "produto": { "id": 15, "nome": "Wrap Proteico Frango Orgânico", "imagemUrl": "/img/wrap.jpg" }, "quantidade": 15, "valorTotal": 510.00 },
    { "posicao": 5, "produto": { "id": 18, "nome": "Bowl Açaí Tropical", "imagemUrl": "/img/bowl-acai.jpg" }, "quantidade": 11, "valorTotal": 308.00 }
  ]
}
```

### 5.2 Gestão de pedidos

Só pedidos do dia **[Spec]**. Cada lista é um array simples de `Pedido`, do mais antigo para o mais novo (ordem de fila) **[Spec]**.

| Lista | Status incluídos **[Spec]** |
| --- | --- |
| `novos` | `PENDENTE`, `PAGO` |
| `em-preparo` | `EM_PREPARO` |
| `prontos` | `PRONTO_PARA_RETIRADA` |
| `concluidos` | `CONCLUIDO` |

Pedidos `CANCELADO` não aparecem em nenhuma lista. O número no cabeçalho de cada coluna é o tamanho do array.

**PATCH `/pedidos/{id}/avancar`** — sem corpo; o back-end decide o próximo status **[Spec]**:

| De | Para |
| --- | --- |
| `PENDENTE` ou `PAGO` | `EM_PREPARO` |
| `EM_PREPARO` | `PRONTO_PARA_RETIRADA` |
| `PRONTO_PARA_RETIRADA` | `CONCLUIDO` |
| `CONCLUIDO` ou `CANCELADO` | erro `409 TRANSICAO_INVALIDA` |

**PATCH `/pedidos/{id}/cancelar`** — só a partir de `PENDENTE` ou `PAGO`; leva a `CANCELADO` e os pontos deixam de contar. Nos outros status: `409 TRANSICAO_INVALIDA`. Não há estorno de pagamento nesta fase **[Spec]**.

As duas respostas de sucesso (`200`) devolvem o `Pedido` atualizado.

### 5.3 Histórico

**GET `/pedidos/historico`**: todos os status, inclusive cancelados. Os filtros são opcionais e combináveis **[Spec]**.

| Parâmetro | Regra |
| --- | --- |
| `codigo` | Busca pelo código do pedido (número) |
| `cliente` | Busca parcial pelo nome, sem diferenciar maiúsculas e minúsculas |
| `dataInicio`, `dataFim` | Intervalo (`AAAA-MM-DD`), ambos inclusivos |
| `modalidade` | `RETIRADA` ou `CONSUMO_LOCAL` |
| `ordenarPor=valor` + `direcao=asc\|desc` | Ordenação pelo valor do pedido. A ordem padrão não está na spec; o protótipo mostra do mais recente para o mais antigo **[Proposta]** |
| `pagina`, `tamanho` | Paginação (padrão: 1 e 10) |

```json
{
  "conteudo": [
    {
      "id": 1046,
      "status": "CONCLUIDO",
      "modalidade": "RETIRADA",
      "criadoEm": "2026-11-02T14:05:00-03:00",
      "cliente": { "id": 220, "nome": "Rodrigo Lima", "telefone": "11988412290" },
      "itens": [
        { "nome": "Sunomono Especial", "quantidade": 1 },
        { "nome": "Suco Detox Refrescante", "quantidade": 2 }
      ],
      "formaPagamento": "PIX",
      "valorTotal": 38.00,
      "pontosGanhos": 38
    },
    {
      "id": 1039,
      "status": "CANCELADO",
      "modalidade": "RETIRADA",
      "criadoEm": "2026-11-02T12:45:00-03:00",
      "cliente": { "id": 241, "nome": "Ana Paula Ramos", "telefone": "11985612345" },
      "itens": [
        { "nome": "Temaki Salmão Simples", "quantidade": 1 },
        { "nome": "Refrigerante Zero 350ml", "quantidade": 1 }
      ],
      "formaPagamento": "CARTAO_CREDITO",
      "valorTotal": 42.00,
      "pontosGanhos": 0,
      "motivoCancelamento": "Cancelado pelo cliente"
    }
  ],
  "pagina": 1,
  "tamanho": 10,
  "total": 84,
  "totalPaginas": 9
}
```

## 6. Telas

### 6.1 Estrutura comum (T1, T2, T3)

**Menu lateral** (sempre visível no desktop):

| Item | Estado nesta sprint |
| --- | --- |
| Visão Geral | Ativo; rota `/dashboard` |
| Pedidos (com selo numérico) | Ativo; rota `/pedidos/hoje`. O selo mostra o `total` do histórico **[Protótipo]** |
| Cardápio, KL CLUB, Clientes | Visíveis, desabilitados ("Em breve") |
| Sair | Visível, sem ação (sem autenticação nesta sprint) |

**Barra superior** (T2 e T3): "KL CLUB Gestão" e um selo com o nome e o estado da loja ("Loja Principal (Aberta)"). Não há endpoint para isso **[Protótipo]**: o texto vem de `configuracoes` no mock e é estático nesta sprint.

### 6.2 T1 — Visão Geral

**Cabeçalho:** título "Visão Geral" e o componente `PeriodoTabs`.

`PeriodoTabs` renderiza as 5 abas a partir de `constants/periodos.js`:

| id | Rótulo | `habilitado` |
| --- | --- | --- |
| `HOJE` | HOJE | `true` (selecionada) |
| `ONTEM` | ONTEM | `false` |
| `SEMANA` | 7 DIAS | `false` |
| `MES` | MENSAL | `false` |
| `ANO` | ANUAL | `false` |

As abas desabilitadas usam `aria-disabled="true"`, não disparam requisição e mostram a dica "Disponível na próxima sprint". Na próxima sprint basta trocar o `habilitado`. O ViewModel já recebe `periodo` e o envia em todas as chamadas (hoje sempre `HOJE`).

**Cartões de KPI** (4 colunas no desktop):

| Cartão | Título | Valor principal | Linha de apoio | Regras |
| --- | --- | --- | --- | --- |
| Faturamento | "Faturamento hoje" | `R$ 3.420,00` | "Meta: R$ 3.000,00" | Sem `meta`, oculta a linha |
| Pedidos | "Pedidos hoje" | `84 pedidos` | "+12% vs. ontem" | Inteiro com sinal (`+` ou `−`); `null` oculta a linha; `0` mostra "0% vs. ontem" |
| Ticket médio | "Ticket médio" | `R$ 40,71` | "Ontem: R$ 39,85" | Sem pedidos: valor "—" e sem linha de apoio |
| Clientes atendidos | "Clientes atendidos" | `71 clientes` | "83% via Totem" | Sem `percentualViaTotem`, oculta a linha |

O texto "hoje" dos títulos vem do rótulo do período selecionado.

**Tabela "Pedidos"** (selo "Ao vivo"), colunas: `# PEDIDO`, `CLIENTE`, `ITENS`, `PAGAMENTO`, `VALOR TOTAL`, `PONTOS GANHOS`.

- Itens no formato `2× Suco Verde, 1× Combo Fit`, em uma linha com reticências; a lista completa fica no `title` da célula.
- Pagamento como chip com ícone (PIX em verde; cartão e voucher em cinza).
- Pontos como chip laranja `+56 pts`.
- Pedido `CANCELADO`: valor riscado, chip "Cancelado" no lugar dos pontos e fundo levemente avermelhado.
- Rodapé: "Mostrando 4 de 84 pedidos" (`conteudo.length` de `total`) e paginação com Anterior, números (com reticências quando houver muitas páginas) e Próximo. Tamanho de página padrão: 4, como no protótipo.

**Distribuição de Pagamentos:** uma barra de progresso por forma, com rótulo, `percentual` arredondado e `(R$ valor)`. A largura da barra usa o percentual exato. Cores: PIX verde, Cartão grafite, Dinheiro verde-acinzentado, Voucher laranja. Cada barra tem `role="progressbar"` com `aria-valuenow`.

**Produtos Mais Vendidos:** selo "Filtro: Hoje" e uma linha por produto, até 5, com imagem, posição, nome, `42 un` e valor em reais. Imagem ausente ou quebrada mostra um quadrado neutro com a inicial do produto.

**Comportamento**

- Cada bloco (KPIs, tabela, pagamentos, produtos) carrega e falha de forma independente. Um erro em um bloco mostra a mensagem e "Tentar novamente" só nele.
- Atualização automática a cada 30 s (`usePolling`), pausada quando a aba do navegador está oculta.
- Trocar de página da tabela não recarrega os outros blocos.

### 6.3 T3 — Gestão de Pedidos: aba Pedidos de Hoje

**Cabeçalho:** título, subtítulo "Controle e expedição em tempo real", botão **Novo Pedido** (desabilitado, sem contrato **[Protótipo]**), abas "Pedidos de Hoje" e "Histórico de Pedidos", indicador "Auto: 30s" e botão de atualizar.

O selo da aba "Pedidos de Hoje" é a soma dos tamanhos das quatro listas.

**Quadro:** 4 colunas, uma por lista (seção 5.2), cada uma com rolagem interna.

| Coluna | Cor de destaque **[Proposta]** | Botões do cartão | Chamada |
| --- | --- | --- | --- |
| Novos Pedidos | âmbar | **Recusar** e **Aceitar** | `cancelar` e `avancar` |
| Em Preparo | azul | **Marcar como Pronto** | `avancar` |
| Prontos para Retirada | roxo | **Marcar como Feito** | `avancar` |
| Concluídos | verde | nenhum | — |

**Cartão de pedido**

- Cabeçalho: `#id`, chip de pontos (`+65 pts`) e, quando houver, a etiqueta de origem (`Kiosk 02`).
- Em Novos Pedidos, mostra também o tempo relativo ("Há 1 min") a partir de `criadoEm` **[Proposta]**.
- Corpo: nome do cliente e itens (`1× Bowl Salmão Fresh & Quinoa`).
- Em Novos Pedidos e Em Preparo, cada item mostra o valor da linha (`itens[].valorTotal`). Em Prontos e Concluídos, não, como no protótipo.
- Quando houver `observacao`: caixa de destaque "Obs: …".
- Rodapé: "Total:" e o valor. Em Concluídos o rótulo é "Total (PIX):" com a forma de pagamento.

**Fluxo de uma ação**

1. O usuário clica no botão do cartão; o botão fica desabilitado com indicador de carregamento (só aquele cartão).
2. **Recusar** abre uma confirmação: "Recusar o pedido #1049? Ele será cancelado e não gerará pontos." Não prometer estorno **[Proposta]**.
3. O ViewModel chama `PATCH`, e em sucesso atualiza o quadro: o cartão sai da coluna de origem e entra, no fim da fila, na coluna de destino (ou some, no caso de cancelamento).
4. Em `409 TRANSICAO_INVALIDA` ou `404`: aviso "Este pedido já foi atualizado por outra pessoa. A lista foi atualizada." e recarga das 4 listas.
5. Em erro de rede: aviso "Sem conexão com o servidor" e o cartão permanece onde está.

**Atualização automática:** as 4 listas são buscadas em paralelo a cada 30 s. O polling é pausado enquanto houver uma ação em andamento e quando a aba está oculta. O botão de atualizar força a recarga e reinicia a contagem.

### 6.4 T2 — Gestão de Pedidos: aba Histórico de Pedidos

**Cabeçalho:** o mesmo do T3, com campo de busca e botão de atualizar.

- **Busca:** campo único com *debounce* de 400 ms. Apenas dígitos (com `#` opcional) enviam `codigo`; qualquer outro texto envia `cliente`. O texto de ajuda passa a ser "Buscar por cliente ou nº do pedido", porque a busca por item não está na spec **[Proposta]**.
- **Filtrar:** painel com Data inicial, Data final e Modalidade (Todas, Retirada, Consumo no local), com Aplicar e Limpar. Mostra um contador de filtros ativos. Qualquer mudança de filtro volta para a página 1.
- **Exportar:** visível e desabilitado (sem contrato **[Protótipo]**).
- **Ordenação:** clique no cabeçalho `VALOR TOTAL` alterna sem ordenação (mais recentes primeiro) → decrescente → crescente, com ícone de seta **[Proposta]**.

**Tabela:** colunas `PEDIDO`, `CLIENTE`, `VALOR TOTAL`, `ITENS DO PEDIDO`, `MODALIDADE`, `DATA & HORÁRIO`.

| Coluna | Exibição |
| --- | --- |
| Pedido | `#1046` em verde |
| Cliente | Nome. Segunda linha: telefone com máscara `(11) 98841-2290`; em `CONSUMO_LOCAL`, `Mesa 02 // Salão` em laranja; em `CANCELADO`, o `motivoCancelamento` (ou "Cancelado") em vermelho |
| Valor total | `R$ 38,00` com chip `+38 pts`. Cancelado: valor riscado e chip "Cancelado" |
| Itens do pedido | `1× Sunomono Especial, 2× Suco Detox Refrescante`, uma linha com reticências e lista completa no `title` |
| Modalidade | Chip: Retirada Balcão (verde) ou Consumo Local (laranja), sem número da mesa |
| Data e horário | `02/11/2026 14:05`, fuso `America/Sao_Paulo` |

Pedido cancelado: linha com fundo levemente avermelhado e chip de modalidade acinzentado.

**Rodapé:** "Exibindo 1–10 de 84 registros" (de `(pagina−1)×tamanho+1` até `+ conteudo.length − 1`) e paginação com Anterior, números, reticências e Próximo. O selo "Histórico de Pedidos" e o selo do menu usam `total`.

## 7. Mock com json-server e axios

Durante o desenvolvimento, o back-end é simulado. O projeto já usa `db.example.json` (versionado) para gerar o `db.json` local, que não é versionado. Os dados desta sprint entram no `db.example.json`.

### 7.1 Por que um servidor de mock próprio

O `json-server` puro só faz CRUD sobre as coleções. Ele não calcula KPIs, percentuais nem ranking, nem aplica a regra de transição de status. Por isso:

- Criar `mock/server.js` usando o `json-server` como módulo, com as rotas da seção 5 registradas **antes** do roteador padrão.
- Trocar o script `api` do `package.json` para `node mock/server.js`. O `npm run dev:all` continua igual.
- No front, nada muda além do `VITE_API_URL`: as chamadas `axios` são exatamente as da produção.

### 7.2 Coleções e regras que o mock implementa

Coleções: `pedidos`, `clientes`, `produtos`, `configuracoes` (nome/estado da loja e meta diária).

| Rota | Regra no mock |
| --- | --- |
| `kpis` | Exclui `CANCELADO`. Faturamento = soma de `valorTotal`; clientes distintos por `cliente.id`; variação e ticket do dia anterior calculados com os pedidos de ontem; `null` nos casos de divisão por zero |
| `tabela` | Todos os pedidos de hoje (com cancelados), por `criadoEm` decrescente, paginados |
| `pagamentos` | Agrupa por forma (crédito e débito juntos em `CARTAO`); percentual = valor da forma ÷ faturamento × 100; exclui `CANCELADO` |
| `produtos-mais-vendidos` | Soma `quantidade` dos itens, exclui `CANCELADO`, top 5 |
| `gestao/*` | Pedidos de hoje filtrados por status, por `criadoEm` crescente |
| `avancar` e `cancelar` | Mesmas transições da seção 5.2; `409` fora delas; ao cancelar, `pontosGanhos = 0` |
| `historico` | Todos os status; filtros combinados; ordenação por valor; `total` dos resultados filtrados |

### 7.3 Dados de teste

- **Datas relativas:** o `db.example.json` guarda `criadoEmMinutosAtras` (ex.: `1`, `45`, `1440`) e o servidor converte em `criadoEm` real ao iniciar (`America/Sao_Paulo`). Assim "hoje" sempre tem dados.
- **Coerência entre telas:** os números sempre vêm dos dados, nunca fixos. Sugestão de massa: hoje, 4 novos + 5 em preparo + 3 prontos + 2 concluídos + 1 cancelado, mais pedidos de ontem (para variação e ticket anterior) e pelo menos 40 pedidos no total (para exercitar a paginação do histórico).
- **Cobertura:** incluir as 2 modalidades, pedidos com `observacao`, com `mesa`, com `origem` de totem, cancelados com e sem motivo, e as 4 formas de pagamento.
- **Simular falhas [Proposta]:** o mock aceita `?_delay=600` (latência em ms) e `?_erro=500` para testar carregamento e erro.
- **Testes manuais:** o `db.json` local é alterado pelos `PATCH`. Para restaurar o estado inicial, apagar o `db.json` e rodar o script de geração do projeto.

## 8. Camada ViewModel

Cada bloco de dados segue o formato `{ status, data, error }`, com `status` em `loading`, `success` ou `error`.

**`useDashboardViewModel(periodo = 'HOJE')`**

| Retorno | Descrição |
| --- | --- |
| `periodos` | Lista de abas (de `constants/periodos.js`) e `periodo` ativo |
| `kpis`, `tabela`, `pagamentos`, `produtos` | Blocos `{ status, data, error }` |
| `tabela.pagina`, `irParaPagina(n)` | Paginação da tabela (só recarrega a tabela) |
| `recarregar(bloco?)` | Recarrega um bloco ou todos |

**`useGestaoPedidosViewModel()`**

| Retorno | Descrição |
| --- | --- |
| `listas` | `{ novos, emPreparo, prontos, concluidos }`, cada uma com `{ status, data, error }` |
| `totalHoje` | Soma dos tamanhos das listas |
| `acaoEmAndamento` | `id` do pedido em atualização, ou `null` |
| `aceitar(id)`, `marcarPronto(id)`, `marcarFeito(id)` | Chamam `avancar` |
| `recusar(id)` | Chama `cancelar` (a confirmação é da View) |
| `atualizar()` | Recarrega as 4 listas |
| `aviso` | Mensagem de sucesso ou erro para o aviso na tela |

**`useHistoricoPedidosViewModel()`**

| Retorno | Descrição |
| --- | --- |
| `filtros` | `{ busca, dataInicio, dataFim, modalidade }` |
| `definirBusca(texto)`, `aplicarFiltros(f)`, `limparFiltros()` | Qualquer mudança volta para a página 1 |
| `ordenacao`, `alternarOrdenacao()` | Ciclo: nenhuma → decrescente → crescente |
| `resultado` | Bloco `{ status, data: envelope, error }` |
| `irParaPagina(n)` | Paginação |

**`usePolling(funcao, intervaloMs, { ativo })`**: chama a função a cada intervalo, não dispara uma nova chamada enquanto a anterior não terminou, cancela requisições pendentes ao desmontar (`AbortController`) e pausa quando `document.visibilityState` é `hidden`.

**`model/entities/pedido.js`** (funções puras, fáceis de testar): `formatarMoeda`, `formatarPontos` (`+56 pts`), `formatarItens` (`2× Suco Verde, 1× Combo Fit`), `formatarDataHora`, `formatarTelefone`, `tempoRelativo` ("Há 1 min"), `rotuloModalidade`, `rotuloPagamento`.

## 9. Estados da interface, responsividade e acessibilidade

### 9.1 Estados

| Situação | Comportamento |
| --- | --- |
| Carregando | Esqueletos (*skeleton*) no formato do bloco; em recarga automática, mantém os dados antigos sem piscar |
| Vazio — dashboard | KPIs zerados (com "—" quando não houver cálculo), tabela "Nenhum pedido hoje ainda", pagamentos e produtos com texto equivalente |
| Vazio — quadro | Cada coluna mostra "Nenhum pedido" |
| Vazio — histórico | "Nenhum pedido encontrado com esses filtros" e botão "Limpar filtros" |
| Erro | Mensagem do erro e "Tentar novamente" no próprio bloco |

### 9.2 Responsividade [Proposta]

O protótipo mostra apenas desktop. Comportamento sugerido:

| Largura | Comportamento |
| --- | --- |
| ≥ 1200 px | Menu lateral fixo; KPIs em 4 colunas; Pagamentos e Produtos lado a lado; quadro com 4 colunas |
| 768–1199 px | Menu recolhido em barra de ícones; KPIs 2×2; quadro com 2 colunas; tabelas com rolagem horizontal |
| < 768 px | Menu em gaveta com botão de abrir; KPIs em 1 ou 2 colunas; tabelas viram lista de cartões; quadro vira uma coluna por vez com abas de status; `PeriodoTabs` com rolagem horizontal |

### 9.3 Visual

Reaproveitar os tokens de `src/styles/global.css` (verdes, `--radius`, `--danger`). Novos tokens semânticos sugeridos:

| Token | Uso |
| --- | --- |
| `--status-novo` (âmbar), `--status-preparo` (azul), `--status-pronto` (roxo), `--status-concluido` (verde) | Borda e fundo dos cartões do quadro e pontos das colunas |
| `--pontos` (laranja) | Chip `+N pts` |
| `--cancelado-bg` (vermelho muito claro) | Linha de pedido cancelado |

No protótipo, vários textos curtos quebram em duas linhas ("7 DIAS", "+60 pts", "Auto: 30s", "Loja Principal (Aberta)", "PIX Instantâneo"). No código, chips, selos e abas usam `white-space: nowrap`.

### 9.4 Acessibilidade

- Abas de período e de Hoje/Histórico: `role="tablist"` e `role="tab"` com `aria-selected`.
- Botões só com ícone têm `aria-label` ("Atualizar", "Limpar campo").
- Avisos de sucesso e erro em região `aria-live="polite"`.
- Foco visível em tudo que é clicável; a confirmação de "Recusar" prende o foco e fecha com Esc.
- Status e modalidade nunca dependem só da cor: sempre há texto no chip.
- Respeitar `prefers-reduced-motion` em animações e indicadores de carregamento.

## 10. Divergências entre o protótipo e a especificação

Pontos que precisam de confirmação com o back-end e o design. Enquanto isso, vale a coluna "Decisão adotada".

| # | Ponto | Especificação | Protótipo | Decisão adotada |
| --- | --- | --- | --- | --- |
| 1 | Itens do pedido | Só o nome do produto | `2× Suco Verde`, e valor da linha em T3 | O contrato traz `nome`, `quantidade` e `valorTotal` |
| 2 | Modalidade | Retirada ou consumo no local | Inclui "Entrega // Motoboy" | Só `RETIRADA` e `CONSUMO_LOCAL`; `ENTREGA` foi removida (exibição, filtro e mock) |
| 3 | Formas de pagamento | "Cartão de crédito" | "Cartão de Crédito / Débito" e "VR / Refeição / Vouchers" agrupados | Pedido com código por forma; distribuição agrupa `CARTAO` |
| 4 | Meta de faturamento | Não existe | "Meta: R$ 3.000,00" | Campo opcional `faturamento.meta` |
| 5 | Origem do pedido | Não existe | "83% via Totem" e etiqueta "Kiosk 02" | Campos opcionais `percentualViaTotem` e `origem` |
| 6 | Valor por produto no ranking | Posição, imagem, nome, quantidade | Mostra também R$ por produto | Campo `valorTotal` no ranking |
| 7 | Observação, telefone, mesa e motivo do cancelamento | Não existem | Aparecem em T2 e T3 | Campos opcionais no `Pedido` |
| 8 | Busca no histórico | Código e cliente | "Cliente, ID ou item" | Busca por código ou cliente; sem busca por item |
| 9 | Ordem padrão do histórico | Só ordenação por valor | Mais recente primeiro | Mais recente primeiro quando não há ordenação |
| 10 | Pontos | Creditados na criação; regra não descrita | Na maioria dos cartões, R$ 1 = 1 ponto (arredondado para baixo), mas #1049 (+60 para R$ 65,40), #1050 (+45 para R$ 52,00) e #1045 (+30 para R$ 44,50) não batem | O front exibe `pontosGanhos` da API, sem calcular |
| 11 | Números entre telas | — | T1 mostra 84 pedidos hoje; T3 mostra 14 hoje e 84 no histórico | Protótipo ilustrativo; o mock gera números coerentes entre telas |
| 12 | Botões sem contrato | — | Novo Pedido, Exportar, estado da loja, Sair | Desabilitados ou estáticos nesta sprint |
| 13 | Caminhos e erros | Só o recurso `/pedidos` e "erro de transição inválida" | — | Caminhos da seção 5 e `409 TRANSICAO_INVALIDA` (a alinhar) |

## 11. Plano de branches e commits

Um branch por funcionalidade, na ordem abaixo, com merge `--no-ff` na `main` ao final de cada um (sem PR, como combinado).

| Ordem | Branch | Entrega | Commits sugeridos |
| --- | --- | --- | --- |
| 1 | `feat/layout-admin` | Menu lateral, barra superior, rotas, tokens novos | `feat(view): AdminLayout com menu lateral e barra superior`; `feat: rotas /dashboard e /pedidos`; `style: tokens de status e pontos` |
| 2 | `feat/model-pedidos` | Constantes, formatadores e ajuste do `httpClient` | `feat(model): constantes de status, modalidade e pagamento`; `feat(model): formatadores de pedido`; `fix(model): httpClient preserva status e código do erro` |
| 3 | `feat/mock-pedidos` | `db.example.json` e `mock/server.js` com todas as rotas | `feat(mock): massa de dados com datas relativas`; `feat(mock): rotas do dashboard`; `feat(mock): rotas de gestão e histórico`; `chore: script api usa o servidor de mock` |
| 4 | `feat/dashboard-kpis` | `PeriodoTabs` + 4 cartões de KPI | `feat(model): dashboardService.kpis`; `feat(viewmodel): useDashboardViewModel (kpis)`; `feat(view): PeriodoTabs`; `feat(view): cartões de KPI` |
| 5 | `feat/dashboard-tabela` | Tabela "Pedidos" com paginação | `feat(model): dashboardService.tabela`; `feat(view): tabela de pedidos do dashboard` |
| 6 | `feat/dashboard-pagamentos-produtos` | Distribuição de pagamentos e produtos mais vendidos | `feat(view): distribuição de pagamentos`; `feat(view): produtos mais vendidos` |
| 7 | `feat/gestao-pedidos-quadro` | Quadro com 4 listas, abas e atualização automática | `feat(model): gestaoPedidosService (listas)`; `feat(viewmodel): usePolling`; `feat(view): quadro de pedidos de hoje` |
| 8 | `feat/gestao-pedidos-acoes` | Aceitar, recusar, marcar pronto e marcar feito | `feat(model): avançar e cancelar pedido`; `feat(view): botões de ação e confirmação de recusa`; `feat(view): tratamento de transição inválida` |
| 9 | `feat/historico-pedidos` | Histórico com busca, filtros, ordenação e paginação | `feat(model): historicoPedidosService`; `feat(viewmodel): useHistoricoPedidosViewModel`; `feat(view): tabela do histórico`; `feat(view): painel de filtros` |

## 12. Critérios de aceite

**Geral**

- [ ] Nenhum componente de View importa `axios`; toda chamada passa por `services/`.
- [ ] Todas as chamadas do dashboard enviam `periodo=HOJE`.
- [ ] As abas ONTEM, 7 DIAS, MENSAL e ANUAL aparecem desabilitadas e não geram requisições.
- [ ] Valores monetários em `R$` com formatação pt-BR; datas em `dd/MM/aaaa HH:mm`.
- [ ] Nada quebra em 360 px, 768 px e 1280 px, e não há rolagem horizontal na página.

**T1 — Visão Geral**

- [ ] Os 4 KPIs mostram os valores da API; variação `null` oculta "vs. ontem"; sem pedidos, o ticket médio mostra "—".
- [ ] Pedidos cancelados aparecem na tabela (riscados, sem pontos) e não entram nos KPIs.
- [ ] Os percentuais da distribuição batem com a API e a soma dos valores é igual ao faturamento.
- [ ] O ranking mostra no máximo 5 produtos, em ordem de posição.
- [ ] Um erro em um bloco não afeta os outros três.

**T3 — Pedidos de Hoje**

- [ ] Os pedidos aparecem na coluna certa, do mais antigo para o mais novo.
- [ ] Aceitar move Novo → Em Preparo; Marcar como Pronto move → Prontos; Marcar como Feito move → Concluídos.
- [ ] Recusar pede confirmação e remove o pedido do quadro.
- [ ] Concluídos não tem botões de ação.
- [ ] Um `409` recarrega as listas e avisa o usuário.
- [ ] A atualização a cada 30 s não interrompe uma ação em andamento e pausa com a aba oculta.

**T2 — Histórico**

- [ ] Busca por código e por parte do nome (sem diferenciar maiúsculas e minúsculas) funciona e volta para a página 1.
- [ ] Filtros de data e modalidade combinam com a busca.
- [ ] Ordenação por valor alterna entre decrescente e crescente.
- [ ] Pedidos cancelados aparecem com valor riscado e sem pontos.
- [ ] "Exibindo X–Y de N registros" e a paginação estão corretos na última página, que pode ter menos itens.

## 14. Login do funcionário

O funcionário entra em `/login` com **usuário ou e-mail** e **senha**. Com sucesso, vai para `/dashboard`; com falha, a tela mostra "Login não realizado" e o motivo, sem sair do login.

### 14.1 Contrato **[Proposta]**

**POST `/auth/login`**, corpo `{ "usuario": "gerente", "senha": "..." }`

| HTTP | Corpo | Quando |
| --- | --- | --- |
| 200 | `{ "token": "...", "usuario": { "id": 1, "nome": "Marina Souza", "perfil": "GERENTE" } }` | Credenciais corretas |
| 401 | `{ "codigo": "CREDENCIAIS_INVALIDAS", "mensagem": "Usuário ou senha incorretos." }` | Usuário inexistente, inativo ou senha errada (a mesma resposta para os três, para não revelar se o usuário existe) |
| 400 | `{ "codigo": "PARAMETRO_INVALIDO", ... }` | Usuário ou senha ausentes |

### 14.2 Camadas

| Camada | Arquivo | Papel |
| --- | --- | --- |
| Model | `model/services/authService.js` | `entrar({ usuario, senha })` chama o POST |
| Model | `model/services/sessaoService.js` | Guarda/lê/limpa a sessão (`sessionStorage`, com queda para a memória) |
| Model | `model/constants/auth.js` | Rotas e mensagens do login |
| Model | `model/api/httpClient.js` | Envia `Authorization: Bearer <token>` em toda requisição quando há sessão |
| ViewModel | `viewmodel/useLoginViewModel.js` | Campos, validação, envio, erro e redirecionamento |
| ViewModel | `viewmodel/useSessaoViewModel.js` | `{ autenticado, usuario, sair }` |
| View | `view/pages/LoginPage/` | Tela de login |
| View | `view/components/{LogoKl,CampoFormulario}/` | Marca e campo com ícone/ação |
| View | `view/routes/RotaProtegida.jsx` | Envia para `/login` quem não tem sessão |

### 14.3 Regras da tela

- Campos vazios: mensagem "Preencha os campos", sem chamar a API.
- `401`: "Usuário ou senha incorretos…"; a senha é limpa e o usuário é mantido. Outros erros (sem conexão, 5xx) mostram a mensagem do `ApiError`.
- A mensagem some ao digitar de novo. O erro é anunciado por leitor de tela (`role="alert"`).
- O botão do olho mostra/oculta a senha.
- Quem já está logado e abre `/login` vai direto para `/dashboard`. O botão **Sair** do menu limpa a sessão e volta ao login.

### 14.4 Mock

- Coleção `usuarios` em `db.example.json` (senha em texto puro: **só para o mock**; nunca reutilize essas senhas). Ela não é exposta pelo CRUD do json-server (`/usuarios` responde 404).
- O `db.json` já existente ganha `usuarios` sozinho na próxima subida da API (ou rode `npm run db:reset`).

| Usuário | E-mail | Senha | Perfil |
| --- | --- | --- | --- |
| `gerente` | `gerente@klclub.com` | `kl@2026` | GERENTE |
| `atendente` | `atendente@klclub.com` | `kl@2026` | ATENDENTE |

### 14.5 Fora do escopo

Recuperação de senha, perfis com permissões diferentes por tela, expiração/renovação do token e validação do token pela API nas demais rotas. Hoje o token só viaja no cabeçalho; o bloqueio das telas é feito pelo front.

