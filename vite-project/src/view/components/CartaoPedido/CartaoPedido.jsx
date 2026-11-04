import { ROTULO_SEM_CADASTRO, STATUS } from '../../../model/constants/pedidos.js'
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
 * Cartão do quadro de pedidos (objeto Pedido da API). A coluna (`lista`) define o que aparece:
 * - novos: tempo relativo e, em PENDENTE (dinheiro), o aviso "Pagar no balcão" e o cartão em azul-petróleo;
 * - novos e emPreparo: valor de cada item;
 * - concluidos: "Total (PIX):".
 * Pedido sem cliente: "Sem cadastro" e sem chip de pontos.
 * `acoes` é o rodapé de botões (fornecido pela página).
 */
export default function CartaoPedido({ pedido, lista, tom, acoes, ocupado = false }) {
  const mostrarValorItem = lista === 'novos' || lista === 'emPreparo'
  const rotuloTotal = lista === 'concluidos' ? `Total (${rotuloPagamentoCurto(pedido.formaPagamento)}):` : 'Total:'
  const tituloId = `pedido-${pedido.idPedido}-titulo`
  const nomeCliente = pedido.usuario?.nome
  const pagarNoBalcao = pedido.statusPedido === STATUS.PENDENTE

  return (
    <article
      className={`${styles.cartao} ${styles[tom] ?? ''} ${pagarNoBalcao ? styles.pagarNoBalcao : ''}`}
      aria-labelledby={tituloId}
      aria-busy={ocupado || undefined}
    >
      <header className={styles.cabecalho}>
        <h3 id={tituloId} className={`${styles.codigo} tabular`}>
          {formatarCodigo(pedido.idPedido)}
        </h3>
        {nomeCliente && <Chip tom="pontos">{formatarPontos(pedido.pontosGerados)}</Chip>}
        {pagarNoBalcao && (
          <Chip tom="laranja" icone="dinheiro">
            Pagar no balcão
          </Chip>
        )}
        {lista === 'novos' && (
          <span className={styles.tempo}>
            <Icone nome="relogio" tamanho={14} />
            <time dateTime={pedido.dataHora}>{tempoRelativo(pedido.dataHora)}</time>
          </span>
        )}
      </header>

      {nomeCliente ? (
        <p className={styles.cliente}>{nomeCliente}</p>
      ) : (
        <p className={`${styles.cliente} ${styles.semCadastro}`}>{ROTULO_SEM_CADASTRO}</p>
      )}

      <ul className={styles.itens}>
        {(pedido.itens ?? []).map((item, i) => (
          <li key={`${item.idProduto ?? item.nome}-${i}`} className={styles.item}>
            <span>{formatarItem(item)}</span>
            {mostrarValorItem && typeof item.valorTotal === 'number' && (
              <span className={`${styles.valorItem} tabular`}>{formatarMoeda(item.valorTotal)}</span>
            )}
          </li>
        ))}
      </ul>

      {pedido.observacoes && (
        <p className={styles.observacao}>
          <strong>Obs:</strong> {pedido.observacoes}
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
