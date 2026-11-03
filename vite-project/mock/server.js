// Servidor de mock do recurso /pedidos (AGENTS.md §7).
// Usa o json-server como módulo: as rotas da seção 5 são registradas ANTES do
// roteador padrão, que continua servindo o CRUD das coleções (ex.: /configuracoes).

import { randomBytes } from 'node:crypto'
import jsonServer from 'json-server'
import { prepararBanco, CAMINHO_DB } from './banco.js'

const PORTA = Number(process.env.PORT ?? 3001)
const DIA_MS = 86_400_000
const OFFSET_SP_MS = -3 * 3_600_000 // America/Sao_Paulo (sem horário de verão desde 2019)

const STATUS = {
  PENDENTE: 'PENDENTE',
  PAGO: 'PAGO',
  EM_PREPARO: 'EM_PREPARO',
  PRONTO_PARA_RETIRADA: 'PRONTO_PARA_RETIRADA',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
}

const PROXIMO_STATUS = {
  PENDENTE: STATUS.EM_PREPARO,
  PAGO: STATUS.EM_PREPARO,
  EM_PREPARO: STATUS.PRONTO_PARA_RETIRADA,
  PRONTO_PARA_RETIRADA: STATUS.CONCLUIDO,
}

const LISTAS_GESTAO = {
  novos: [STATUS.PENDENTE, STATUS.PAGO],
  'em-preparo': [STATUS.EM_PREPARO],
  prontos: [STATUS.PRONTO_PARA_RETIRADA],
  concluidos: [STATUS.CONCLUIDO],
}

const ROTULO_STATUS = {
  PENDENTE: 'está pendente',
  PAGO: 'está pago',
  EM_PREPARO: 'está em preparo',
  PRONTO_PARA_RETIRADA: 'está pronto para retirada',
  CONCLUIDO: 'já foi concluído',
  CANCELADO: 'já foi cancelado',
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const arred = (n, casas = 2) => Math.round(n * 10 ** casas) / 10 ** casas

/** Data (AAAA-MM-DD) em São Paulo para um instante. */
function diaSP(instante) {
  return new Date(instante + OFFSET_SP_MS).toISOString().slice(0, 10)
}

/** "Dia" do pedido: data de criação em America/Sao_Paulo (§4.1). */
function diaDoPedido(pedido) {
  return diaSP(new Date(pedido.criadoEm).getTime())
}

function hojeSP() {
  return diaSP(Date.now())
}

function ontemSP() {
  return diaSP(Date.now() - DIA_MS)
}

function erro(res, http, codigo, mensagem) {
  return res.status(http).json({ codigo, mensagem })
}

function lerInteiro(valor, padrao) {
  if (valor === undefined || valor === '') return padrao
  const n = Number(valor)
  return Number.isInteger(n) ? n : NaN
}

function paginar(lista, pagina, tamanho) {
  const total = lista.length
  const inicio = (pagina - 1) * tamanho
  return {
    conteudo: lista.slice(inicio, inicio + tamanho),
    pagina,
    tamanho,
    total,
    totalPaginas: Math.ceil(total / tamanho),
  }
}

function lerPaginacao(req, res, tamanhoPadrao) {
  const pagina = lerInteiro(req.query.pagina, 1)
  const tamanho = lerInteiro(req.query.tamanho, tamanhoPadrao)
  if (!(pagina >= 1) || !(tamanho >= 1 && tamanho <= 100)) {
    erro(res, 400, 'PARAMETRO_INVALIDO', 'Parâmetros de paginação inválidos (pagina ≥ 1, 1 ≤ tamanho ≤ 100).')
    return null
  }
  return { pagina, tamanho }
}

/** Remove campos internos do mock antes de responder. */
function publico(pedido) {
  const { criadoEmMinutosAtras: _min, ...resto } = pedido
  return { ...resto, itens: (resto.itens ?? []).map(({ produtoId: _id, ...item }) => item) }
}

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const porCriadoEm = (a, b) => new Date(a.criadoEm) - new Date(b.criadoEm)

// ---------------------------------------------------------------------------
// Servidor
// ---------------------------------------------------------------------------

prepararBanco()

const app = jsonServer.create()
const router = jsonServer.router(CAMINHO_DB)
const db = router.db

app.use(jsonServer.defaults({ logger: true }))

// Simulação de falhas (§7.3): ?_delay=600 e ?_erro=500
app.use((req, res, next) => {
  const atraso = Number(req.query._delay)
  const status = Number(req.query._erro)
  delete req.query._delay
  delete req.query._erro
  const seguir = () => {
    if (status >= 400 && status <= 599) {
      return erro(res, status, 'ERRO_SIMULADO', `Erro ${status} simulado pelo mock.`)
    }
    return next()
  }
  if (atraso > 0) setTimeout(seguir, Math.min(atraso, 30_000))
  else seguir()
})

// ---- Autenticação ----------------------------------------------------------
// A coleção `usuarios` guarda senha em texto puro: só serve para o mock. Por isso
// ela não é exposta pelo CRUD genérico do json-server.

app.use('/usuarios', (_req, res) => erro(res, 404, 'NAO_ENCONTRADO', 'Recurso inexistente.'))

app.post('/auth/login', jsonServer.bodyParser, (req, res) => {
  const { usuario, senha } = req.body ?? {}
  if (typeof usuario !== 'string' || typeof senha !== 'string' || usuario.trim() === '' || senha === '') {
    return erro(res, 400, 'PARAMETRO_INVALIDO', 'Informe usuário e senha.')
  }
  const alvo = normalizar(usuario.trim())
  const encontrado = (db.get('usuarios').value() ?? []).find(
    (u) => u.ativo !== false && (normalizar(u.usuario) === alvo || normalizar(u.email) === alvo),
  )
  if (!encontrado || encontrado.senha !== senha) {
    return erro(res, 401, 'CREDENCIAIS_INVALIDAS', 'Usuário ou senha incorretos.')
  }
  return res.json({
    token: randomBytes(24).toString('base64url'),
    usuario: { id: encontrado.id, nome: encontrado.nome, perfil: encontrado.perfil },
  })
})

const pedidos = () => db.get('pedidos').value()
const pedidosDoDia = (dia) => pedidos().filter((p) => diaDoPedido(p) === dia)
const validos = (lista) => lista.filter((p) => p.status !== STATUS.CANCELADO)
const somaValor = (lista) => arred(lista.reduce((s, p) => s + (p.valorTotal ?? 0), 0))

function exigirPeriodoHoje(req, res, next) {
  const periodo = req.query.periodo ?? 'HOJE'
  if (periodo !== 'HOJE') {
    return erro(res, 400, 'PARAMETRO_INVALIDO', `Período "${periodo}" ainda não é suportado. Use HOJE.`)
  }
  return next()
}

// ---- Dashboard -------------------------------------------------------------

app.get('/pedidos/dashboard/kpis', exigirPeriodoHoje, (req, res) => {
  const hoje = validos(pedidosDoDia(hojeSP()))
  const ontem = validos(pedidosDoDia(ontemSP()))
  const faturamento = somaValor(hoje)
  const faturamentoOntem = somaValor(ontem)

  const clientes = new Map()
  for (const p of hoje) {
    const viaTotem = p.origem?.tipo === 'TOTEM'
    clientes.set(p.cliente.id, Boolean(clientes.get(p.cliente.id)) || viaTotem)
  }
  const viaTotem = [...clientes.values()].filter(Boolean).length
  const meta = db.get('configuracoes.metaFaturamentoDiaria').value()

  res.json({
    periodo: 'HOJE',
    faturamento: { valor: faturamento, meta: typeof meta === 'number' ? meta : null },
    pedidos: {
      quantidade: hoje.length,
      variacaoPercentual: ontem.length ? arred(((hoje.length - ontem.length) / ontem.length) * 100, 1) : null,
    },
    ticketMedio: {
      valor: hoje.length ? arred(faturamento / hoje.length) : null,
      valorPeriodoAnterior: ontem.length ? arred(faturamentoOntem / ontem.length) : null,
    },
    clientesAtendidos: {
      quantidade: clientes.size,
      percentualViaTotem: clientes.size ? Math.round((viaTotem / clientes.size) * 100) : null,
    },
  })
})

app.get('/pedidos/dashboard/tabela', exigirPeriodoHoje, (req, res) => {
  const paginacao = lerPaginacao(req, res, 10)
  if (!paginacao) return
  const lista = pedidosDoDia(hojeSP())
    .sort((a, b) => porCriadoEm(b, a))
    .map(publico)
  res.json(paginar(lista, paginacao.pagina, paginacao.tamanho))
})

app.get('/pedidos/dashboard/pagamentos', exigirPeriodoHoje, (req, res) => {
  const hoje = validos(pedidosDoDia(hojeSP()))
  const faturamento = somaValor(hoje)
  const grupos = new Map()
  for (const p of hoje) {
    const forma = p.formaPagamento?.startsWith('CARTAO') ? 'CARTAO' : p.formaPagamento
    grupos.set(forma, (grupos.get(forma) ?? 0) + p.valorTotal)
  }
  const itens = [...grupos]
    .map(([forma, valor]) => ({
      forma,
      valor: arred(valor),
      percentual: faturamento ? arred((valor / faturamento) * 100, 1) : 0,
    }))
    .sort((a, b) => b.valor - a.valor)
  res.json({ periodo: 'HOJE', faturamento, itens })
})

app.get('/pedidos/dashboard/produtos-mais-vendidos', exigirPeriodoHoje, (req, res) => {
  const catalogo = db.get('produtos').value()
  const acumulado = new Map()
  for (const p of validos(pedidosDoDia(hojeSP()))) {
    for (const item of p.itens ?? []) {
      const chave = item.produtoId ?? item.nome
      const atual = acumulado.get(chave) ?? { produtoId: item.produtoId, nome: item.nome, quantidade: 0, valorTotal: 0 }
      atual.quantidade += item.quantidade ?? 1
      atual.valorTotal += item.valorTotal ?? 0
      acumulado.set(chave, atual)
    }
  }
  const itens = [...acumulado.values()]
    .sort((a, b) => b.quantidade - a.quantidade || b.valorTotal - a.valorTotal)
    .slice(0, 5)
    .map((a, i) => {
      const produto = catalogo.find((c) => c.id === a.produtoId)
      return {
        posicao: i + 1,
        produto: { id: a.produtoId ?? null, nome: produto?.nome ?? a.nome, imagemUrl: produto?.imagemUrl ?? null },
        quantidade: a.quantidade,
        valorTotal: arred(a.valorTotal),
      }
    })
  res.json({ periodo: 'HOJE', itens })
})

// ---- Gestão ----------------------------------------------------------------

app.get('/pedidos/gestao/:lista', (req, res) => {
  const status = LISTAS_GESTAO[req.params.lista]
  if (!status) return erro(res, 404, 'LISTA_NAO_ENCONTRADA', `Lista "${req.params.lista}" não existe.`)
  const lista = pedidosDoDia(hojeSP())
    .filter((p) => status.includes(p.status))
    .sort(porCriadoEm)
    .map(publico)
  return res.json(lista)
})

function transicao(req, res, calcular) {
  const id = Number(req.params.id)
  const registro = db.get('pedidos').find({ id })
  const pedido = registro.value()
  if (!pedido) return erro(res, 404, 'PEDIDO_NAO_ENCONTRADO', `O pedido #${req.params.id} não existe.`)
  const mudanca = calcular(pedido)
  if (!mudanca) {
    const situacao = ROTULO_STATUS[pedido.status] ?? `está em ${pedido.status}`
    return erro(res, 409, 'TRANSICAO_INVALIDA', `O pedido #${id} ${situacao} e não permite esta ação.`)
  }
  const atualizado = registro.assign(mudanca).write()
  return res.json(publico(atualizado))
}

app.patch('/pedidos/:id/avancar', (req, res) =>
  transicao(req, res, (p) => (PROXIMO_STATUS[p.status] ? { status: PROXIMO_STATUS[p.status] } : null)),
)

app.patch('/pedidos/:id/cancelar', (req, res) =>
  transicao(req, res, (p) =>
    p.status === STATUS.PENDENTE || p.status === STATUS.PAGO
      ? { status: STATUS.CANCELADO, pontosGanhos: 0, motivoCancelamento: 'Recusado pela loja' }
      : null,
  ),
)

// ---- Histórico -------------------------------------------------------------

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

app.get('/pedidos/historico', (req, res) => {
  const { cliente, dataInicio, dataFim, modalidade, ordenarPor, direcao } = req.query
  const paginacao = lerPaginacao(req, res, 10)
  if (!paginacao) return undefined

  const codigo = req.query.codigo !== undefined && req.query.codigo !== '' ? Number(req.query.codigo) : null
  if (codigo !== null && !Number.isInteger(codigo)) return erro(res, 400, 'PARAMETRO_INVALIDO', 'Código do pedido inválido.')
  for (const [nome, valor] of [['dataInicio', dataInicio], ['dataFim', dataFim]]) {
    if (valor && (!DATA_RE.test(valor) || Number.isNaN(Date.parse(valor)))) {
      return erro(res, 400, 'PARAMETRO_INVALIDO', `${nome} deve estar no formato AAAA-MM-DD.`)
    }
  }
  if (dataInicio && dataFim && dataInicio > dataFim) {
    return erro(res, 400, 'PARAMETRO_INVALIDO', 'A data inicial é posterior à data final.')
  }
  if (modalidade && !['RETIRADA', 'CONSUMO_LOCAL'].includes(modalidade)) {
    return erro(res, 400, 'PARAMETRO_INVALIDO', 'Modalidade deve ser RETIRADA ou CONSUMO_LOCAL.')
  }
  if (ordenarPor && ordenarPor !== 'valor') return erro(res, 400, 'PARAMETRO_INVALIDO', 'Só é possível ordenar por valor.')
  if (direcao && !['asc', 'desc'].includes(direcao)) return erro(res, 400, 'PARAMETRO_INVALIDO', 'direcao deve ser asc ou desc.')

  const termo = normalizar(cliente)
  let lista = pedidos().filter((p) => {
    const dia = diaDoPedido(p)
    if (codigo !== null && p.id !== codigo) return false
    if (termo && !normalizar(p.cliente?.nome).includes(termo)) return false
    if (dataInicio && dia < dataInicio) return false
    if (dataFim && dia > dataFim) return false
    if (modalidade && p.modalidade !== modalidade) return false
    return true
  })

  const recentesPrimeiro = (a, b) => porCriadoEm(b, a)
  if (ordenarPor === 'valor') {
    const sinal = direcao === 'asc' ? 1 : -1
    lista = lista.sort((a, b) => sinal * (a.valorTotal - b.valorTotal) || recentesPrimeiro(a, b))
  } else {
    lista = lista.sort(recentesPrimeiro)
  }

  return res.json(paginar(lista.map(publico), paginacao.pagina, paginacao.tamanho))
})

// Roteador padrão do json-server (CRUD das coleções) por último.
app.use(router)

app.listen(PORTA, () => {
  console.log(`Mock da API em http://localhost:${PORTA} (hoje em São Paulo: ${hojeSP()})`)
})
