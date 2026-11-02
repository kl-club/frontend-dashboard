import Icone from '../Icone/Icone.jsx'
import styles from './Paginacao.module.css'

/** Números a exibir: 1, …, vizinhos da atual, …, última. */
function paginasVisiveis(atual, total, vizinhos = 1) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const itens = new Set([1, total])
  for (let p = atual - vizinhos; p <= atual + vizinhos; p++) if (p > 1 && p < total) itens.add(p)
  if (atual <= 3) [2, 3, 4].forEach((p) => itens.add(p))
  if (atual >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => itens.add(p))
  const ordenadas = [...itens].sort((a, b) => a - b)
  const resultado = []
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push(`reticencias-${p}`)
    resultado.push(p)
  })
  return resultado
}

export default function Paginacao({ pagina, totalPaginas, onIrPara, desabilitado = false, rotulo = 'Paginação' }) {
  if (!totalPaginas || totalPaginas <= 1) return null
  const itens = paginasVisiveis(pagina, totalPaginas)

  return (
    <nav className={styles.paginacao} aria-label={rotulo}>
      <button
        type="button"
        className={styles.botao}
        onClick={() => onIrPara(pagina - 1)}
        disabled={desabilitado || pagina <= 1}
      >
        <Icone nome="setaEsquerda" tamanho={16} />
        <span className={styles.texto}>Anterior</span>
      </button>

      <ul className={styles.numeros}>
        {itens.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`${styles.numero} ${item === pagina ? styles.atual : ''} tabular`}
                aria-current={item === pagina ? 'page' : undefined}
                aria-label={`Página ${item}`}
                onClick={() => item !== pagina && onIrPara(item)}
                disabled={desabilitado && item !== pagina}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={styles.reticencias} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={styles.botao}
        onClick={() => onIrPara(pagina + 1)}
        disabled={desabilitado || pagina >= totalPaginas}
      >
        <span className={styles.texto}>Próximo</span>
        <Icone nome="setaDireita" tamanho={16} />
      </button>
    </nav>
  )
}
