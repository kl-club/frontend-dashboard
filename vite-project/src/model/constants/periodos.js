// Abas de período do dashboard. A API só aceita HOJE por enquanto.
// Na próxima sprint basta trocar `habilitado` para liberar uma aba.

export const PERIODOS = Object.freeze([
  { id: 'HOJE', rotulo: 'HOJE', rotuloTitulo: 'hoje', habilitado: true },
  { id: 'ONTEM', rotulo: 'ONTEM', rotuloTitulo: 'ontem', habilitado: false },
  { id: 'SEMANA', rotulo: '7 DIAS', rotuloTitulo: 'em 7 dias', habilitado: false },
  { id: 'MES', rotulo: 'MENSAL', rotuloTitulo: 'no mês', habilitado: false },
  { id: 'ANO', rotulo: 'ANUAL', rotuloTitulo: 'no ano', habilitado: false },
])

export const PERIODO_PADRAO = 'HOJE'

export const DICA_PERIODO_DESABILITADO = 'Disponível na próxima sprint'

export function buscarPeriodo(id) {
  return PERIODOS.find((p) => p.id === id) ?? PERIODOS[0]
}
