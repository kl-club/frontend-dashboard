import { formatarInteiro } from '../../../model/entities/pedido.js'
import Icone from '../Icone/Icone.jsx'
import Esqueleto from '../Esqueleto/Esqueleto.jsx'
import EstadoBloco from '../EstadoBloco/EstadoBloco.jsx'
import Painel from '../Painel/Painel.jsx'
import ProdutoImagem from '../ProdutoImagem/ProdutoImagem.jsx'
import styles from './ProdutosMaisVendidos.module.css'

const LIMITE = 3

export default function ProdutosMaisVendidos({ bloco, rotuloFiltro, onTentarNovamente }) {
  // A API devolve até 5 produtos ({ posicao, idProduto, nome, imagem, quantidadeVendida }); a tela mostra 3.
  const itens = [...(bloco.data?.produtos ?? [])].sort((a, b) => a.posicao - b.posicao).slice(0, LIMITE)

  return (
    <Painel
      titulo="Produtos Mais Vendidos"
      selo={
        <span className={styles.filtro}>
          <Icone nome="relogio" tamanho={14} />
          Filtro: {rotuloFiltro}
        </span>
      }
      icone="clube"
      ocupado={bloco.status === 'loading'}
    >
      <div className={styles.corpo}>
        {bloco.status === 'loading' && (
          <ul className={styles.lista} aria-hidden="true">
            {[0, 1, 2].map((i) => (
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
                <li key={item.idProduto ?? item.posicao} className={styles.item}>
                  <ProdutoImagem url={item.imagem} nome={item.nome} tamanho={48} escuro />
                  <span className={`${styles.posicao} tabular`} aria-label={`Posição ${item.posicao}`}>
                    {item.posicao}
                  </span>
                  <span className={styles.nome} title={item.nome}>
                    {item.nome ?? '—'}
                  </span>
                  <span className={`${styles.numeros} tabular`}>
                    <strong>{formatarInteiro(item.quantidadeVendida)} un</strong>
                  </span>
                </li>
              ))}
            </ol>
          ))}
      </div>
    </Painel>
  )
}
