import { formatarMoeda, formatarPercentual, rotuloFormaDistribuicao } from '../../../model/entities/pedido.js'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import Painel from '../Painel/Painel.jsx'
import styles from './DistribuicaoPagamentos.module.css'

const TOM = { PIX: 'pix', CARTAO: 'cartao', DINHEIRO: 'dinheiro', VOUCHER: 'voucher' }

function Barra({ item }) {
  const rotulo = rotuloFormaDistribuicao(item.forma)
  const percentual = Math.min(100, Math.max(0, Number(item.percentual) || 0))
  return (
    <li className={styles.item}>
      <div className={styles.linha}>
        <span className={styles.rotulo}>{rotulo}</span>
        <span className={`${styles.numeros} tabular`}>
          <strong>{formatarPercentual(item.percentual)}</strong> ({formatarMoeda(item.valor)})
        </span>
      </div>
      <div
        className={styles.trilho}
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentual}
        aria-valuetext={`${formatarPercentual(item.percentual)}, ${formatarMoeda(item.valor)}`}
      >
        <span className={`${styles.barra} ${styles[TOM[item.forma]] ?? styles.outro}`} style={{ width: `${percentual}%` }} />
      </div>
    </li>
  )
}

export default function DistribuicaoPagamentos({ bloco, onTentarNovamente }) {
  const itens = bloco.data?.itens ?? []
  return (
    <Painel titulo="Distribuição de Pagamentos" ocupado={bloco.status === 'loading'}>
      <div className={styles.corpo}>
        {bloco.status === 'loading' && (
          <ul className={styles.lista} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className={styles.item}>
                <Esqueleto largura="55%" />
                <Esqueleto altura={10} raio={999} />
              </li>
            ))}
          </ul>
        )}
        {bloco.status === 'error' && (
          <EstadoBloco tipo="erro" mensagem={bloco.error?.message} acao={onTentarNovamente} />
        )}
        {bloco.status === 'success' &&
          (itens.length === 0 ? (
            <EstadoBloco mensagem="Nenhum pagamento hoje ainda" />
          ) : (
            <ul className={styles.lista}>
              {itens.map((item) => (
                <Barra key={item.forma} item={item} />
              ))}
            </ul>
          ))}
      </div>
    </Painel>
  )
}
