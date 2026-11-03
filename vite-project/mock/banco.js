// Preparação do db.json local a partir do db.example.json (AGENTS.md §7.3).
//
// O db.example.json guarda `criadoEmMinutosAtras`; a cada início do servidor
// esse valor vira um `criadoEm` real (America/Sao_Paulo), para que "hoje"
// sempre tenha dados. Mudanças de status feitas pelos PATCH continuam no db.json.
//
// Uso direto (restaurar o estado inicial):  npm run db:reset

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const CAMINHO_EXEMPLO = resolve(RAIZ, 'db.example.json')
export const CAMINHO_DB = resolve(RAIZ, 'db.json')

const MIN_MS = 60_000
const DIA_MIN = 1440
const OFFSET_SP_MS = -3 * 3_600_000

function inicioDoDiaSP(instante) {
  const dia = new Date(instante + OFFSET_SP_MS).toISOString().slice(0, 10)
  return Date.parse(`${dia}T00:00:00-03:00`)
}

function isoSP(instante) {
  return `${new Date(instante + OFFSET_SP_MS).toISOString().slice(0, 19)}-03:00`
}

/**
 * Converte minutos atrás em data real. Um pedido com N minutos atrás pertence ao
 * dia floor(N / 1440) antes de hoje; se a subtração cruzar a meia-noite (servidor
 * iniciado de madrugada), o horário é preso ao começo daquele dia, mantendo a ordem.
 */
export function criadoEmDe(minutosAtras, agora = Date.now()) {
  const diasAtras = Math.floor(minutosAtras / DIA_MIN)
  const inicioDia = inicioDoDiaSP(agora) - diasAtras * DIA_MIN * MIN_MS
  let instante = agora - minutosAtras * MIN_MS
  if (instante < inicioDia) instante = inicioDia + (DIA_MIN - (minutosAtras % DIA_MIN)) * 1000
  return isoSP(instante)
}

export function prepararBanco({ resetar = false } = {}) {
  if (resetar || !existsSync(CAMINHO_DB)) copyFileSync(CAMINHO_EXEMPLO, CAMINHO_DB)
  const banco = JSON.parse(readFileSync(CAMINHO_DB, 'utf8'))
  // db.json criado antes do login não tem `usuarios`: completa a partir do exemplo.
  if (!Array.isArray(banco.usuarios)) {
    const exemplo = JSON.parse(readFileSync(CAMINHO_EXEMPLO, 'utf8'))
    if (Array.isArray(exemplo.usuarios)) banco.usuarios = exemplo.usuarios
  }
  const agora = Date.now()
  for (const pedido of banco.pedidos ?? []) {
    if (typeof pedido.criadoEmMinutosAtras === 'number') {
      pedido.criadoEm = criadoEmDe(pedido.criadoEmMinutosAtras, agora)
    }
  }
  writeFileSync(CAMINHO_DB, `${JSON.stringify(banco, null, 2)}\n`)
  return banco
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const banco = prepararBanco({ resetar: true })
  console.log(`db.json recriado a partir do db.example.json (${banco.pedidos.length} pedidos).`)
}
