import {
  formatarCodigo,
  formatarItem,
  formatarMoeda,
  formatarPontos,
  rotuloPagamentoCurto,
  tempoRelativo,
} from '../../../model/entities/pedido.js'
import Chip from '../Chip/Chip.jsx'
import Icone from '../Icone/Icone.jsx'
import styles from './CartaoPedido.module.css'

/**
 * Cartão do quadro de pedidos. A coluna (`lista`) define o que aparece:
 * - novos: tempo relativo; novos e emPreparo: valor de cada item;
 * - concluidos: "Total (PIX):".
 * `acoes` é o rodapé de botões (fornecido pela página).
 */
export default function CartaoPedido({ pedido, lista, tom, acoes, ocupado = false }) {
  const mostrarValorItem = lista === 'novos' || lista === 'emPreparo'
  const rotuloTotal = lista === 'concluidos' ? `Total (${rotuloPagamentoCurto(pedido.formaPagamento)}):` : 'Total:'
  const tituloId = `pedido-${pedido.id}-titulo`

  return (
    <article className={`${styles.cartao} ${styles[tom] ?? ''}`} aria-labelledby={tituloId} aria-busy={ocupado || undefined}>
      <header className={styles.cabecalho}>
        <h3 id={tituloId} className={`${styles.codigo} tabular`}>
          {formatarCodigo(pedido.id)}
        </h3>
        <Chip tom="pontos">{formatarPontos(pedido.pontosGanhos)}</Chip>
        {pedido.origem?.identificacao && (
          <Chip tom="neutro" icone={pedido.origem.tipo === 'TOTEM' ? 'totem' : undefined}>
            {pedido.origem.identificacao}
          </Chip>
        )}
        {lista === 'novos' && (
          <span className={styles.tempo}>
            <Icone nome="relogio" tamanho={14} />
            <time dateTime={pedido.criadoEm}>{tempoRelativo(pedido.criadoEm)}</time>
          </span>
        )}
      </header>

      <p className={styles.cliente}>{pedido.cliente?.nome ?? '—'}</p>

      <ul className={styles.itens}>
        {(pedido.itens ?? []).map((item, i) => (
          <li key={`${item.nome}-${i}`} className={styles.item}>
            <span>{formatarItem(item)}</span>
            {mostrarValorItem && typeof item.valorTotal === 'number' && (
              <span className={`${styles.valorItem} tabular`}>{formatarMoeda(item.valorTotal)}</span>
            )}
          </li>
        ))}
      </ul>

      {pedido.observacao && (
        <p className={styles.observacao}>
          <strong>Obs:</strong> {pedido.observacao}
        </p>
      )}

      <footer className={styles.rodape}>
        <p className={styles.total}>
          <span>{rotuloTotal}</span>
          <strong className="tabular">{formatarMoeda(pedido.valorTotal)}</strong>
        </p>
        {acoes && <div className={styles.acoes}>{acoes}</div>}
      </footer>
    </article>
  )
}
