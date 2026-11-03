import { useState } from 'react'
import styles from './ProdutoImagem.module.css'

/**
 * Imagem do produto; ausente ou quebrada vira um quadrado neutro com a inicial.
 * `escuro`: versão para fundo verde-escuro (borda clara e inicial em branco).
 */
export default function ProdutoImagem({ url, nome, tamanho = 44, escuro = false }) {
  const [quebrada, setQuebrada] = useState(false)
  const estilo = { width: tamanho, height: tamanho }
  const tema = escuro ? styles.escuro : ''

  if (!url || quebrada) {
    return (
      <span className={`${styles.inicial} ${tema}`} style={estilo} aria-hidden="true">
        {(nome ?? '?').trim().charAt(0).toUpperCase()}
      </span>
    )
  }
  return <img className={`${styles.imagem} ${tema}`} style={estilo} src={url} alt="" loading="lazy" onError={() => setQuebrada(true)} />
}
