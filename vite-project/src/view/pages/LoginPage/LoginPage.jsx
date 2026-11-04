import { Navigate } from 'react-router-dom'
import { ROTA_APOS_LOGIN } from '../../../model/constants/auth.js'
import { useLoginViewModel } from '../../../viewmodel/useLoginViewModel.js'
import { useSessaoViewModel } from '../../../viewmodel/useSessaoViewModel.js'
import CampoFormulario from '../../components/CampoFormulario/CampoFormulario.jsx'
import Icone from '../../components/Icone/Icone.jsx'
import LogoKl from '../../components/LogoKl/LogoKl.jsx'
import styles from './LoginPage.module.css'

const ID_ERRO = 'login-erro'

export default function LoginPage() {
  const { autenticado } = useSessaoViewModel()
  const vm = useLoginViewModel()

  if (autenticado) return <Navigate to={ROTA_APOS_LOGIN} replace />

  return (
    <div className={styles.pagina}>
      <div className={styles.cartao}>
        <header className={styles.topo}>
          <LogoKl />
          <span className={styles.divisor} aria-hidden="true" />
          <span className={styles.area}>
            <Icone nome="escudo" tamanho={20} />
            <span>
              Área de gestão
            </span>
          </span>
        </header>

        <main className={styles.corpo}>
          <span className={styles.selo} aria-hidden="true">
            <Icone nome="escudoUsuario" tamanho={32} />
          </span>
          <h1 className="sr-only">Acesso à área de gestão</h1>

          <form className={styles.formulario} onSubmit={vm.enviar} noValidate>
            <CampoFormulario
              id="email"
              rotulo="E-mail"
              icone="usuario"
              tipo="email"
              valor={vm.email}
              onChange={vm.alterarEmail}
              placeholder="Digite seu e-mail"
              autoComplete="username"
              invalido={vm.camposInvalidos.email}
              descritoPor={vm.erro ? ID_ERRO : undefined}
              desabilitado={vm.enviando}
              autoFocus
            />

            <CampoFormulario
              id="senha"
              rotulo="Senha de Acesso"
              icone="cadeado"
              tipo={vm.mostrarSenha ? 'text' : 'password'}
              valor={vm.senha}
              onChange={vm.alterarSenha}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              invalido={vm.camposInvalidos.senha}
              descritoPor={vm.erro ? ID_ERRO : undefined}
              desabilitado={vm.enviando}
              sufixo={
                <button
                  type="button"
                  className={styles.olho}
                  onClick={vm.alternarSenha}
                  aria-label={vm.mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={vm.mostrarSenha}
                >
                  <Icone nome={vm.mostrarSenha ? 'olhoFechado' : 'olho'} tamanho={22} />
                </button>
              }
            />

            <div className={styles.aviso} aria-live="assertive">
              {vm.erro && (
                <div id={ID_ERRO} role="alert" className={styles.erro}>
                  <Icone nome="alertaCirculo" tamanho={20} className={styles.erroIcone} />
                  <p>
                    <strong>{vm.erro.titulo}.</strong> {vm.erro.mensagem}
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className={styles.entrar} disabled={vm.enviando}>
              {vm.enviando ? (
                <>
                  <span className={styles.girando} aria-hidden="true" />
                  Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <Icone nome="setaDireita" tamanho={20} />
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
