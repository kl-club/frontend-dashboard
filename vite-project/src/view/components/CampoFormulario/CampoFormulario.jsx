import Icone from '../Icone/Icone.jsx'
import styles from './CampoFormulario.module.css'

/**
 * Campo de formulário: rótulo (com ação opcional à direita), ícone à esquerda e
 * `sufixo` opcional dentro do campo (ex.: botão de mostrar senha).
 */
export default function CampoFormulario({
  id,
  rotulo,
  icone,
  tipo = 'text',
  valor,
  onChange,
  placeholder,
  autoComplete,
  invalido = false,
  descritoPor,
  desabilitado = false,
  autoFocus = false,
  acaoRotulo,
  sufixo,
}) {
  return (
    <div className={styles.campo}>
      <div className={styles.cabecalho}>
        <label htmlFor={id} className={styles.rotulo}>
          {rotulo}
        </label>
        {acaoRotulo}
      </div>
      <div className={`${styles.caixa} ${invalido ? styles.invalida : ''}`}>
        {icone && <Icone nome={icone} tamanho={20} className={styles.icone} />}
        <input
          id={id}
          name={id}
          type={tipo}
          className={`${styles.entrada} ${sufixo ? styles.comSufixo : ''}`}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalido || undefined}
          aria-describedby={descritoPor}
          disabled={desabilitado}
          autoFocus={autoFocus}
          autoCapitalize="none"
          spellCheck={false}
        />
        {sufixo && <div className={styles.sufixo}>{sufixo}</div>}
      </div>
    </div>
  )
}
