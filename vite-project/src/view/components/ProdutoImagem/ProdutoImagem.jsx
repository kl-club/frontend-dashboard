import { useState } from 'react'
import styles from './ProdutoImagem.module.css'

/** Imagem do produto; ausente ou quebrada vira um quadrado neutro com a inicial. */
export default function ProdutoImagem({ url, nome, tamanho = 44 }) {
  const [quebrada, setQuebrada] = useState(false)
  const estilo = { width: tamanho, height: tamanho }

  if (!url || quebrada) {
    return (
      <span className={styles.inicial} style={estilo} aria-hidden="true">
        {(nome ?? '?').trim().charAt(0).toUpperCase()}
      </span>
    )
  }
  return <img className={styles.imagem} style={estilo} src={url} alt="" loading="lazy" onError={() => setQuebrada(true)} />
}
