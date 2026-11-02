import { formatarInteiro, formatarMoeda } from '../../../model/entities/pedido.js'
import Chip from '../Chip/Chip.jsx'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import Painel from '../Painel/Painel.jsx'
import ProdutoImagem from '../ProdutoImagem/ProdutoImagem.jsx'
import styles from './ProdutosMaisVendidos.module.css'

const LIMITE = 5

export default function ProdutosMaisVendidos({ bloco, rotuloFiltro, onTentarNovamente }) {
  const itens = [...(bloco.data?.itens ?? [])].sort((a, b) => a.posicao - b.posicao).slice(0, LIMITE)

  return (
    <Painel
      titulo="Produtos Mais Vendidos"
      extra={<Chip tom="neutro">Filtro: {rotuloFiltro}</Chip>}
      ocupado={bloco.status === 'loading'}
    >
      <div className={styles.corpo}>
        {bloco.status === 'loading' && (
          <ul className={styles.lista} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className={styles.item}>
                <Esqueleto largura={44} altura={44} raio={10} />
                <Esqueleto largura="60%" />
              </li>
            ))}
          </ul>
        )}
        {bloco.status === 'error' && (
          <EstadoBloco tipo="erro" mensagem={bloco.error?.message} acao={onTentarNovamente} />
        )}
        {bloco.status === 'success' &&
          (itens.length === 0 ? (
            <EstadoBloco mensagem="Nenhum produto vendido hoje ainda" />
          ) : (
            <ol className={styles.lista}>
              {itens.map((item) => (
                <li key={item.produto?.id ?? item.posicao} className={styles.item}>
                  <ProdutoImagem url={item.produto?.imagemUrl} nome={item.produto?.nome} />
                  <span className={`${styles.posicao} tabular`} aria-label={`Posição ${item.posicao}`}>
                    {item.posicao}º
                  </span>
                  <span className={styles.nome} title={item.produto?.nome}>
                    {item.produto?.nome ?? '—'}
                  </span>
                  <span className={`${styles.numeros} tabular`}>
                    <strong>{formatarInteiro(item.quantidade)} un</strong>
                    {typeof item.valorTotal === 'number' && <span>{formatarMoeda(item.valorTotal)}</span>}
                  </span>
                </li>
              ))}
            </ol>
          ))}
      </div>
    </Painel>
  )
}
