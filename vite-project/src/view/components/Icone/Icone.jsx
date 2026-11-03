// Conjunto de ícones em SVG inline (traço, 24×24). Decorativos por padrão:
// quem usa o ícone sozinho num botão deve dar o aria-label ao botão.

const CAMINHOS = {
  painel: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  pedidos: (
    <>
      <path d="M6 3h12l1 4H5l1-4Z" />
      <path d="M5 7h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z" />
      <path d="M9 11h6M9 15h4" />
    </>
  ),
  cardapio: (
    <>
      <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z" />
      <path d="M8 8h6M8 12h6M8 16h3" />
      <path d="M18 8h2v12h-2" />
    </>
  ),
  clube: (
    <>
      <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z" />
    </>
  ),
  clientes: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5c2.4 0 4 1.5 4.5 4" />
    </>
  ),
  sair: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  atualizar: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  filtro: <path d="M4 5h16l-6 7.5V19l-4 1.5v-8L4 5Z" />,
  exportar: (
    <>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 19h14" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  setaEsquerda: <path d="m14.5 6-6 6 6 6" />,
  setaDireita: <path d="m9.5 6 6 6-6 6" />,
  ordenar: <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />,
  ordenarDesc: <path d="M12 5v14M7 14l5 5 5-5" />,
  ordenarAsc: <path d="M12 19V5M7 10l5-5 5 5" />,
  pix: (
    <>
      <path d="m12 3 4.5 4.5L12 12 7.5 7.5 12 3Z" />
      <path d="m12 12 4.5 4.5L12 21l-4.5-4.5L12 12Z" />
      <path d="M3 12l4.5-4.5M3 12l4.5 4.5M21 12l-4.5-4.5M21 12l-4.5 4.5" />
    </>
  ),
  cartao: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  dinheiro: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  voucher: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5V7Z" />
      <path d="M10 8v8" strokeDasharray="2 2" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  loja: (
    <>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
      <path d="M5 11.5V20h14v-8.5M10 20v-5h4v5" />
    </>
  ),
  grafico: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9h9" />
      <path d="M12 12l-6.4 6.4" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="9.5" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.7" r="1" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  olhoFechado: (
    <>
      <path d="M6.3 7.7A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M10.6 5.6c.4-.1.9-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 4.2" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3l7 2.5v6c0 4.5-2.9 7.7-7 9.5-4.1-1.8-7-5-7-9.5v-6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  escudoUsuario: (
    <>
      <path d="M12 3l7 2.5v6c0 4.5-2.9 7.7-7 9.5-4.1-1.8-7-5-7-9.5v-6L12 3Z" />
      <circle cx="12" cy="10.2" r="2.3" />
      <path d="M8 16c.9-1.5 2.2-2.2 4-2.2s3.1.7 4 2.2" />
    </>
  ),
  alertaCirculo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.2M12 16.3v.1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerta: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  totem: (
    <>
      <rect x="7" y="3" width="10" height="13" rx="1.5" />
      <path d="M10 20h4M12 16v4M10 7h4" />
    </>
  ),
}

export default function Icone({ nome, tamanho = 18, className, titulo }) {
  const caminho = CAMINHOS[nome]
  if (!caminho) return null
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      focusable="false"
    >
      {titulo && <title>{titulo}</title>}
      {caminho}
    </svg>
  )
}
