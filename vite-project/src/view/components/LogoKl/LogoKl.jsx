import styles from './LogoKl.module.css'

/** Marca KL Club: ícone de 4 blocos (um laranja) + nome + legenda. */
export default function LogoKl() {
  return (
    <div className={styles.logo}>
      <svg className={styles.icone} viewBox="0 0 60 60" aria-hidden="true" focusable="false">
        <rect x="2.5" y="2.5" width="55" height="55" rx="13" fill="#fff" stroke="#1f7a4c" strokeWidth="3.5" />
        <rect x="13" y="13" width="15" height="15" rx="4" fill="#1f7a4c" />
        <rect x="32" y="13" width="15" height="15" rx="4" fill="#1f7a4c" />
        <rect x="13" y="32" width="15" height="15" rx="4" fill="#1f7a4c" />
        <path d="M38 32h5a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4v-5a6 6 0 0 1 6-6Z" fill="#f27518" />
      </svg>
      <div className={styles.texto}>
        <span className={styles.nome}>KL Club</span>
        <span className={styles.legenda}>Pontos &amp; Autoatendimento</span>
      </div>
    </div>
  )
}
